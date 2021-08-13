import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import type {
  Channel,
  ChannelState,
  ChannelStateAndData,
  ClientStateAndData,
  OwnUserResponse,
  StreamChat,
  TokenOrProvider,
  UserResponse,
} from 'stream-chat';

import type {
  DefaultAttachmentType,
  DefaultChannelType,
  DefaultCommandType,
  DefaultEventType,
  DefaultMessageType,
  DefaultReactionType,
  DefaultUserType,
  UnknownType,
} from './types/types';

export const STREAM_CHAT_CLIENT_DATA = 'STREAM_CHAT_CLIENT_DATA';
export const STREAM_CHAT_CHANNELS_DATA = 'STREAM_CHAT_CHANNELS_DATA';
const STREAM_CHAT_SDK_VERSION = 'STREAM_CHAT_SDK_VERSION';
const STREAM_CHAT_CLIENT_VERSION = 'STREAM_CHAT_CLIENT_VERSION';
const STREAM_CHAT_CHANNELS_ORDER = 'STREAM_CHAT_CHANNELS_ORDER';

const CURRENT_SDK_VERSION = require('../package.json').version;
const CURRENT_CLIENT_VERSION = require('stream-chat/package.json').version;

type ChannelsOrder = { [index: string]: number } | null;

export type CacheKeys =
  | typeof STREAM_CHAT_CLIENT_DATA
  | typeof STREAM_CHAT_CHANNELS_DATA
  | typeof STREAM_CHAT_SDK_VERSION
  | typeof STREAM_CHAT_CLIENT_VERSION
  | typeof STREAM_CHAT_CHANNELS_ORDER;
export type CacheValues<
  At extends UnknownType = DefaultAttachmentType,
  Ch extends UnknownType = DefaultChannelType,
  Co extends string = DefaultCommandType,
  Ev extends UnknownType = DefaultEventType,
  Me extends UnknownType = DefaultMessageType,
  Re extends UnknownType = DefaultReactionType,
  Us extends UnknownType = DefaultUserType,
> = {
  STREAM_CHAT_CHANNELS_DATA: ChannelStateAndData<At, Ch, Co, Ev, Me, Re, Us>;
  STREAM_CHAT_CHANNELS_ORDER: ChannelsOrder;
  STREAM_CHAT_CLIENT_DATA: ClientStateAndData<At, Ch, Co, Ev, Me, Re, Us>;
  STREAM_CHAT_CLIENT_VERSION: string;
  STREAM_CHAT_SDK_VERSION: string;
};

export type CacheInterface<
  At extends UnknownType = DefaultAttachmentType,
  Ch extends UnknownType = DefaultChannelType,
  Co extends string = DefaultCommandType,
  Ev extends UnknownType = DefaultEventType,
  Me extends UnknownType = DefaultMessageType,
  Re extends UnknownType = DefaultReactionType,
  Us extends UnknownType = DefaultUserType,
> = {
  getItem: <Key extends CacheKeys>(
    key: Key,
  ) => Promise<CacheValues<At, Ch, Co, Ev, Me, Re, Us>[Key] | null>;
  removeItem: <Key extends CacheKeys>(key: Key) => Promise<void>;
  setItem: <Key extends CacheKeys>(key: Key, value: string) => Promise<void>;
};

export type CacheInterfaceSync<
  At extends UnknownType = DefaultAttachmentType,
  Ch extends UnknownType = DefaultChannelType,
  Co extends string = DefaultCommandType,
  Ev extends UnknownType = DefaultEventType,
  Me extends UnknownType = DefaultMessageType,
  Re extends UnknownType = DefaultReactionType,
  Us extends UnknownType = DefaultUserType,
> = {
  getItem: <Key extends CacheKeys>(key: Key) => CacheValues<At, Ch, Co, Ev, Me, Re, Us>[Key];
  removeItem: <Key extends CacheKeys>(key: Key) => void;
  setItem: <Key extends CacheKeys>(key: Key, value: string) => void;
};

// 1 message = ~2KB
// 2 * 800 = ~1.6MB of messages per channel
const MAX_MESSAGES_PER_CHANNEL = 800;
// 2 * 300 = ~600KB of messages per thread
const MAX_MESSAGES_PER_THREAD = 300;
// If all messages are threads storing 500+ messages - worst case scenario
// 800 * 300 * 2 = ~500MB per channel total
// If there are no threads in channel - best case scenario
// 2 & 800 = ~1.6MB per channel total

// I would say middle ground is all channels store 800 messages, having ~100 threads
// with ~100 messages and ending up with 2 * 100 * 100 = 20MB + 1.6MB from 800 regular messages

// If we store 70 channels, 70 * 21.6MB, we initialize the client with 1.5GB of data in memory already

function cropOlderMessages<
  At extends UnknownType = DefaultAttachmentType,
  Ch extends UnknownType = DefaultChannelType,
  Co extends string = DefaultCommandType,
  Ev extends UnknownType = DefaultEventType,
  Me extends UnknownType = DefaultMessageType,
  Re extends UnknownType = DefaultReactionType,
  Us extends UnknownType = DefaultUserType,
>(channelsData: ChannelStateAndData<At, Ch, Co, Ev, Me, Re, Us> | null) {
  // This logics takes care of removing older messages when reinitializing the channel state in order to avoid
  // a possible overflow
  return channelsData.map((channelData) => {
    const channelState = channelData.state;
    const remainingMessagesMap: { [index: string]: boolean } = {};
    const messages = channelState.messages.slice(-MAX_MESSAGES_PER_CHANNEL);

    const pinnedMessages = channelState.pinnedMessages.filter((m) => remainingMessagesMap[m.id]);
    const threads = Object.entries(channelState.threads).reduce((acc, next) => {
      const [id, value] = next;
      // Only adds threads for remaining messages
      if (remainingMessagesMap[id]) {
        acc[id] = value.slice(-MAX_MESSAGES_PER_THREAD);
      }
      return acc;
    }, {} as Record<string, Array<ReturnType<ChannelState<At, Ch, Co, Ev, Me, Re, Us>['formatMessage']>>>);

    return { ...channelData, state: { ...channelState, messages, pinnedMessages, threads } };
  });
}

export default class StreamCache<
  At extends UnknownType = DefaultAttachmentType,
  Ch extends UnknownType = DefaultChannelType,
  Co extends string = DefaultCommandType,
  Ev extends UnknownType = DefaultEventType,
  Me extends UnknownType = DefaultMessageType,
  Re extends UnknownType = DefaultReactionType,
  Us extends UnknownType = DefaultUserType,
> {
  private static instance: StreamCache; // type is undefined|StreamChat, unknown is due to TS limitations with statics
  private client: StreamChat<At, Ch, Co, Ev, Me, Re, Us>;
  private cacheInterface: CacheInterface<At, Ch, Co, Ev, Me, Re, Us>;
  private currentNetworkState: boolean | null;
  private initialNetworkStatePromise: Promise<boolean>;
  private resolveInitialNetworkState?: (value: boolean | PromiseLike<boolean>) => void;
  private cachedChannelsOrder: ChannelsOrder;
  private tokenOrProvider: TokenOrProvider;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor(
    client: StreamChat<At, Ch, Co, Ev, Me, Re, Us>,
    cacheInterface: CacheInterface<At, Ch, Co, Ev, Me, Re, Us>,
    tokenOrProvider: TokenOrProvider,
  ) {
    this.client = client;
    this.cacheInterface = cacheInterface;
    this.currentNetworkState = null;
    this.initialNetworkStatePromise = new Promise((res) => (this.resolveInitialNetworkState = res));
    this.cachedChannelsOrder = null;
    this.tokenOrProvider = tokenOrProvider;

    this.startWatchers();
  }

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance<
    At extends UnknownType = DefaultAttachmentType,
    Ch extends UnknownType = DefaultChannelType,
    Co extends string = DefaultCommandType,
    Ev extends UnknownType = DefaultEventType,
    Me extends UnknownType = DefaultMessageType,
    Re extends UnknownType = DefaultReactionType,
    Us extends UnknownType = DefaultUserType,
  >(
    client?: StreamChat<At, Ch, Co, Ev, Me, Re, Us>,
    cacheInterface?: CacheInterface<At, Ch, Co, Ev, Me, Re, Us>,
    tokenOrProvider?: TokenOrProvider,
  ): StreamCache<At, Ch, Co, Ev, Me, Re, Us> {
    if (!StreamCache.instance) {
      if (!(client && cacheInterface)) {
        throw new Error('StreamCache should be initialized with client and cacheInterface params');
      }
      StreamCache.instance = new StreamCache(
        client,
        cacheInterface,
        tokenOrProvider,
      ) as unknown as StreamCache;
    }

    return StreamCache.instance as unknown as StreamCache<At, Ch, Co, Ev, Me, Re, Us>;
  }

  startWatchers() {
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        const { channels: currentChannelsData, client: currentClientData } =
          this.client.getStateData();
        this.cacheInterface.setItem(STREAM_CHAT_SDK_VERSION, CURRENT_SDK_VERSION);
        this.cacheInterface.setItem(STREAM_CHAT_CLIENT_VERSION, CURRENT_CLIENT_VERSION);
        this.cacheInterface.setItem(STREAM_CHAT_CLIENT_DATA, currentClientData);
        this.cacheInterface.setItem(STREAM_CHAT_CHANNELS_DATA, currentChannelsData);
        this.cacheInterface.setItem(STREAM_CHAT_CHANNELS_ORDER, this.cachedChannelsOrder);
      }
    });

    NetInfo.addEventListener((state) => {
      if (
        state.isInternetReachable !== null &&
        this.currentNetworkState === null &&
        this.resolveInitialNetworkState
      ) {
        this.currentNetworkState = state.isConnected && state.isInternetReachable;
        return this.resolveInitialNetworkState(this.currentNetworkState);
      }

      if (state.isConnected && state.isInternetReachable && !this.currentNetworkState) {
        this.client.openConnection();
        this.currentNetworkState = true;
      } else if ((!state.isConnected || !state.isInternetReachable) && this.currentNetworkState) {
        this.currentNetworkState = false;
      }
    });
  }

  async rehydrate(clientData: ClientStateAndData<At, Ch, Co, Ev, Me, Re, Us>) {
    const channelsData = await this.cacheInterface.getItem(STREAM_CHAT_CHANNELS_DATA);

    const sdkCachedVersion = await this.cacheInterface.getItem(STREAM_CHAT_SDK_VERSION);
    const clientCachedVersion = await this.cacheInterface.getItem(STREAM_CHAT_CLIENT_VERSION);

    this.cachedChannelsOrder = await this.cacheInterface.getItem(STREAM_CHAT_CHANNELS_ORDER);

    if (clientData && channelsData) {
      const sdkVersionChanged = sdkCachedVersion !== CURRENT_SDK_VERSION;
      const clientVersionChanged = clientCachedVersion !== CURRENT_CLIENT_VERSION;
      if (sdkVersionChanged || clientVersionChanged) {
        // This avoids problems if (accross versions) anything changes in the format of the cached data
        console.info(
          'Version change detected on Stream libraries, skipping offline initialization and cleaning up cache...',
        );
        this.clear();
      } else {
        this.client.reInitializeWithState(clientData, cropOlderMessages(channelsData));
      }
    } else {
      console.info(
        'No cache found for clientData or channelsData. Skipping offline initialization...',
      );
    }
  }

  connect(clientData: ClientStateAndData<At, Ch, Co, Ev, Me, Re, Us>) {
    const user = {
      id: clientData.user.id,
      name: clientData.user.name,
    } as OwnUserResponse<Ch, Co, Us> | UserResponse<Us>;

    return this.client.connectUser(user, this.tokenOrProvider);
  }

  async offlineConnect(clientData: ClientStateAndData<At, Ch, Co, Ev, Me, Re, Us>) {
    const user = {
      id: clientData.user.id,
      name: clientData.user.name,
    } as OwnUserResponse<Ch, Co, Us> | UserResponse<Us>;

    this.client.userID = clientData.user.id;
    this.client.anonymous = false;
    // TODO maybe move this logics to client instead of calling private methods?
    // eslint-disable-next-line no-underscore-dangle
    await this.client._setToken(user, this.tokenOrProvider);
    // eslint-disable-next-line no-underscore-dangle
    this.client._setUser(user);
  }

  async hasCachedData() {
    return !!(await this.cacheInterface.getItem(STREAM_CHAT_CLIENT_DATA));
  }

  async initialize() {
    const clientData = await this.cacheInterface.getItem(STREAM_CHAT_CLIENT_DATA);
    const hasNetwork = await this.initialNetworkStatePromise;

    const promises = [];

    if (hasNetwork) {
      promises.push(this.connect(clientData));
    } else {
      // If there is no connection, dont wait for authenticate (aka connectUser), just use it to
      // initialize user/socket on the client side
      this.offlineConnect(clientData);
    }

    promises.push(this.rehydrate(clientData));

    return Promise.all(promises);
  }

  syncChannelsCachedOrder(channels: Channel<At, Ch, Co, Ev, Me, Re, Us>[]) {
    this.cachedChannelsOrder = channels.reduce((acc, next, index) => {
      if (next.id) {
        acc[next.id] = index;
      }
      return acc;
    }, {} as { [index: string]: number });
  }

  orderChannelsBasedOnCachedOrder(channels: Channel<At, Ch, Co, Ev, Me, Re, Us>[]) {
    const currentChannelsOrder = this.cachedChannelsOrder;

    if (currentChannelsOrder) {
      return channels.sort((a, b) => {
        if (a.id && b.id) {
          return currentChannelsOrder[a.id] - currentChannelsOrder[b.id];
        }
        // TODO this sort logics seems to be wrong. Still need to fix it.
        return 99999;
      });
    }
    return channels;
  }

  clear() {
    return Promise.all([
      this.cacheInterface.removeItem(STREAM_CHAT_SDK_VERSION),
      this.cacheInterface.removeItem(STREAM_CHAT_CLIENT_VERSION),
      this.cacheInterface.removeItem(STREAM_CHAT_CLIENT_DATA),
      this.cacheInterface.removeItem(STREAM_CHAT_CHANNELS_DATA),
      this.cacheInterface.removeItem(STREAM_CHAT_CHANNELS_ORDER),
    ]);
  }
}
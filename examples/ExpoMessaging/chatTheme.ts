import DEFAULT_THEME from './theme';

export const chatTheme = {
  colors: {
    reactionBubbleColor: 'red', //DEFAULT_THEME.palette.grey[200],
    reactionBubbleBorder: DEFAULT_THEME.palette.grey[400] + '59',
    accent_blue: DEFAULT_THEME.palette.blue[400],
  },
  dateHeader: {
    text: {
      fontFamily: DEFAULT_THEME.fonts.secondary,
    },
  },
  messageList: {
    listContainer: {
      backgroundColor: DEFAULT_THEME.colors.background,
    },
    contentContainer: {
      backgroundColor: DEFAULT_THEME.colors.background,
    },
    container: {
      backgroundColor: DEFAULT_THEME.colors.background,
    },
    messageSystem: {
      container: {
        backgroundColor: DEFAULT_THEME.colors.background,
      },
      text: {
        fontFamily: DEFAULT_THEME.fonts.secondary,
      },
      line: {
        height: 0,
      },
    },
  },
  messageSimple: {
    content: {
      containerInner: {
        backgroundColor: DEFAULT_THEME.palette.grey[600],
        borderColor: DEFAULT_THEME.palette.grey[600],
      },
      markdown: {
        text: {
          color: 'white',
          fontFamily: DEFAULT_THEME.fonts.secondary,
          fontSize: 15,
        },
      },
    },
    reactionList: {
      reactionBubble: {
        backgroundColor: DEFAULT_THEME.palette.grey[200],
        borderColor: DEFAULT_THEME.palette.grey[400] + '59',
      },
      reactionBubbleBackground: {
        backgroundColor: DEFAULT_THEME.palette.grey[200],
        borderColor: DEFAULT_THEME.palette.grey[400] + '59',
      },
    },
    status: {
      checkIcon: {
        pathFill: '#7A7A7A',
      },
    },
    card: {
      footer: {
        title: {
          color: 'white',
        },
        description: {
          color: DEFAULT_THEME.palette.grey[200],
        },
      },
    },
  },
  reply: {
    messageContainer: {
      backgroundColor: DEFAULT_THEME.palette.grey[200],
      borderColor: DEFAULT_THEME.palette.grey[600],
    },
    markdownStyles: {
      text: { color: DEFAULT_THEME.palette.background },
    },
  },
  messageInput: {
    container: {
      backgroundColor: DEFAULT_THEME.colors.background,
      borderTopColor: DEFAULT_THEME.palette.grey[400],
      borderTopWidth: 0.3,
    },
    inputBoxContainer: {
      borderColor: DEFAULT_THEME.palette.grey[400],
    },
    inputBox: {
      color: 'white',
      fontFamily: DEFAULT_THEME.fonts.secondary,
    },
    editingBoxHeaderTitle: {
      color: 'white',
      fontFamily: DEFAULT_THEME.fonts.secondary,
    },
    suggestions: {
      commandsHeader: {
        container: {
          backgroundColor: DEFAULT_THEME.colors.background,
        },
        title: {
          color: DEFAULT_THEME.palette.grey[200],
          fontFamily: DEFAULT_THEME.fonts.secondary,
        },
      },
      command: {
        container: {
          backgroundColor: DEFAULT_THEME.colors.background,
        },
        title: {
          color: 'white',
          fontFamily: DEFAULT_THEME.fonts.secondary,
        },
        args: {
          color: DEFAULT_THEME.palette.grey[200],
          fontFamily: DEFAULT_THEME.fonts.secondary,
        },
      },
    },
  },
  channelListMessenger: {
    flatListContent: {
      backgroundColor: DEFAULT_THEME.colors.background,
      paddingBottom: '20%',
    },
    flatList: {
      backgroundColor: DEFAULT_THEME.colors.background,
    },
  },
  channelPreview: {
    container: {
      backgroundColor: DEFAULT_THEME.colors.background,
      borderBottomColor: DEFAULT_THEME.palette.grey[200],
      borderTopColor: DEFAULT_THEME.palette.grey[200],
      borderBottomWidth: 0,
    },
    title: {
      color: 'white',
      fontWeight: '400',
      fontFamily: DEFAULT_THEME.fonts.secondary,
      fontSize: 15,
    },
    message: {
      fontFamily: DEFAULT_THEME.fonts.secondary,
    },
  },
  loadingIndicator: {
    loadingText: {
      color: 'white',
    },
  },
};

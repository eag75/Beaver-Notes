import { Node, mergeAttributes, wrappingInputRule } from '@tiptap/core';

export const yellowCallout = Node.create({
  name: 'yellowCallout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      class: {
        default:
          'p-1 yellowCallout border-l-4 border-yellow-300 pl-4 bg-yellow-500 bg-opacity-10',
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div.yellowCallout' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      setYellowCallout:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-c': () => this.editor.commands.toggleCallout(),
    };
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: /(?:^|\s)::yellow\s?$/,
        type: this.type,
        getContent: (match) => {
          const [, yellow] = match;
          return yellow ? [{ type: 'text', text: yellow }] : undefined;
        },
      }),
    ];
  },
});

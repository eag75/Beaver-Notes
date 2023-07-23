export default {
  welcome: {
    id: 'welcome',
    title: 'Welcome to Beaver Notes',
    content:
      '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"noteLabel","attrs":{"id":"Introduction","label":null}},{"type":"text","text":" "},{"type":"noteLabel","attrs":{"id":"Tutorial","label":null}},{"type":"text","text":" "}]},{"type":"paragraph","content":[{"type":"text","text":"Thanks for downloading our app. Get ready to master note-taking like a pro while keeping your data private. With Beaver Notes, you can effortlessly capture and organize your thoughts, ideas, and important details, all securely stored on your device. Let\'s dive in and make note-taking a breeze!"}]},{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Master Organization"}]},{"type":"paragraph","content":[{"type":"text","text":"To make it easier to look up or find your notes, you can labels them with as many labels as you want. This allows you to categorize your notes based on topics, projects, or any other criteria you choose. Additionally, you can link a note to another note by typing double at signs (@@) and selecting a note or using the link menu in the toolbar. This powerful linking feature helps you establish connections and create a web of related information. With Beaver Notes\' markdown formatting, your notes will be even more structured and organized for further information check "},{"type":"linkNote","attrs":{"id":"markdown-formatting","label":"Markdown Formatting"},"marks":[{"type":"link","attrs":{"href":"note://markdown-formatting","target":"_blank"}}]},{"type":"text","text":"."}]},{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Markdown formatting"}]},{"type":"paragraph","content":[{"type":"text","text":"Beaver Notes supports some of the markdown syntaxes, so you can faster to formatting your notes. To learn more about this, you can open the "},{"type":"linkNote","attrs":{"id":"markdown-formatting","label":"Markdown Formatting"},"marks":[{"type":"link","attrs":{"href":"note://markdown-formatting","target":"_blank"}}]},{"type":"text","text":" note."}]},{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Backup, Protect, and Import Your Data"}]},{"type":"paragraph","content":[{"type":"text","text":"Keep your notes safe and secure with Beaver Notes. Easily create backups by going to the settings page ("},{"type":"text","marks":[{"type":"code"}],"text":"Ctrl+, / Cmd+,"},{"type":"text","text":" ) and clicking the export button. To add an extra layer of protection, enable the *Encrypt with password* checkbox. When importing data, simply click the import button. If your data is password-protected, enter the password to access it."}]},{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Quick Access to Your Notes and Commands"}]},{"type":"paragraph","content":[{"type":"text","text":"The command prompt feature in our app makes it easy to locate your notes or execute commands. To open the command prompt, simply press"},{"type":"text","marks":[{"type":"code"}],"text":"Ctrl+P / Cmd+P"},{"type":"text","text":" or press "},{"type":"text","marks":[{"type":"code"}],"text":"Ctrl+Shift+P / Cmd+Shift+P"},{"type":"text","text":" to quickly search for specific commands. With this convenient functionality, navigating through your notes app becomes effortless. Stay organized and in control with our command prompt. "}]},{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Wrap up: Feedback and Updates"}]},{"type":"paragraph","content":[{"type":"text","text":"We appreciate your feedback! To report a bug or provide advice, open a GitHub issue on our  "},{"type":"text","marks":[{"type":"link","attrs":{"href":"https://github.com/Daniele-rolli/Beaver-Notes","target":"_blank"}}],"text":"Github repo"},{"type":"text","text":". Stay in the loop with our newsletter for updates on new features and improvements. Sign up now to receive the latest news. Thank you for your support!"}]}]}',
  },
  markdown: {
    id: 'markdown-formatting',
    title: 'Markdown Formatting',
    content:
      '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"noteLabel","attrs":{"id":"Tutorial","label":null}},{"type":"text","text":" "}]},{"type":"paragraph","content":[{"type":"text","text":"Beaver Notes also has a markdown formatting feature, which means you can write markdown syntax in the editor. And here are some code examples of how to write markdown syntax."}]},{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Code"}]},{"type":"paragraph","content":[{"type":"text","text":"To add a code block you can use triple backticks (```) and the code block will be on auto mode. To use a specific language just add the language name after the backticks like ```javascript or use the select that provided on the code block. Beaver Notes supported around 170 languages and to exit from a code block press "},{"type":"text","marks":[{"type":"code"}],"text":"Ctrl + Enter"},{"type":"text","text":"."}]},{"type":"codeBlock","attrs":{"language":null},"content":[{"type":"text","text":"#include <iostream>\\n\\nint main() {\\n  std::cout << \\"Hello World!\\";\\n  return 0;\\n}"}]},{"type":"codeBlock","attrs":{"language":"javascript"},"content":[{"type":"text","text":"function helloWorld() {\\n  console.log(\'Hello World!\');\\n}"}]},{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Text Formatting"}]},{"type":"paragraph","content":[{"type":"text","text":"Here are some inline text formatting that you can apply: "},{"type":"text","marks":[{"type":"bold"}],"text":"bold"},{"type":"text","text":", "},{"type":"text","marks":[{"type":"italic"}],"text":"italic"},{"type":"text","text":", "},{"type":"text","marks":[{"type":"strike"}],"text":"strikethrough"},{"type":"text","text":", "},{"type":"text","marks":[{"type":"code"}],"text":"inline code"},{"type":"text","text":" , "},{"type":"text","marks":[{"type":"highlight"}],"text":"highlight"},{"type":"text","text":"."}]},{"type":"codeBlock","attrs":{"language":"markdown"},"content":[{"type":"text","text":"**Bold**\\n*Italic*\\n~~Strikethrough~~\\n`Inline code`\\n==highlight=="}]},{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Lists"}]},{"type":"paragraph","content":[{"type":"text","text":"There are two types of lists that you can use in Beaver Notes. They are bullet lists and ordered lists, bullet list like its name is a list that using a bullet "}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Like this"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Or this"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Nested list"}]}]}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"and the ordered list is a list that counts upwards starting."}]},{"type":"orderedList","attrs":{"start":1},"content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Like this"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Or this"}]},{"type":"orderedList","attrs":{"start":1},"content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Nested list"}]}]}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"When you are on a new line of a list and press the tab to nested it, or press "},{"type":"text","marks":[{"type":"code"}],"text":"shift"},{"type":"text","text":" + "},{"type":"text","marks":[{"type":"code"}],"text":"tab"},{"type":"text","text":" to sink the lists."}]},{"type":"codeBlock","attrs":{"language":"markdown"},"content":[{"type":"text","text":"- Bullet list\\n1. Ordered list"}]},{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Headings"}]},{"type":"paragraph","content":[{"type":"text","text":"There are six levels of heading that you can use. To use heading level 1, you only need to write `# Headings`, for heading level 2 `## Heading`, heading level 3 `### Heading`, and so on. And it will look like this."}]},{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Heading 1"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Heading 2"}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Heading 3"}]},{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Image"}]},{"type":"paragraph","content":[{"type":"text","text":"To add image to Beaver Notes editor, you can either paste the image from you clipboard, drag and drop it, use the image menu at the toolbar, or link it using markdown. To edit the image source, you can click the image and a popover will show up."}]},{"type":"image","attrs":{"src":"https://picsum.photos/800/400","alt":"Random image","title":null}},{"type":"codeBlock","attrs":{"language":"markdown"},"content":[{"type":"text","text":"![Random image](https://picsum.photos/800/400)"}]},{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Math"}]},{"type":"paragraph","content":[{"type":"text","text":"You also can write KaTeX equations inside the editor. If you want to write inline match, you only need to wrap your KaTeX expressions in a dollar sign ($). And it will look like this  "},{"type":"math_inline","content":[{"type":"text","text":"E=mc^2"}]},{"type":"text","text":". "},{"type":"hardBreak"},{"type":"text","text":"And if you want to write a multi-line of KaTeX expressions, enter a new line and type double dollar signs($$) And then press space."}]},{"type":"mathBlock","attrs":{"content":"f(\\\\relax{x}) = \\\\int_{-\\\\infty}^\\\\infty\\n    f(\\\\hat\\\\xi\\\\,)e^{2 \\\\pi i \\\\xi x}\\n    \\\\,d\\\\xi\\n","macros":"{\\n  \\\\f: \\"#1f(#2)\\"\\n}","init":"true"}},{"type":"codeBlock","attrs":{"language":"markdown"},"content":[{"type":"text","text":"$E=mc^2$"}]},{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Labels"}]},{"type":"paragraph","content":[{"type":"text","text":"To organize your notes, you can pass a label for each of your notes. To add a label to your note, type a hashtag and write the name of your label like this "},{"type":"noteLabel","attrs":{"id":"Tutorial","label":null}},{"type":"text","text":" . When you click a label, the app will filter notes by that label."}]},{"type":"codeBlock","attrs":{"language":"markdown"},"content":[{"type":"text","text":"#Tutorial #AnotherLabel"}]},{"type":"paragraph"}]}',
  },
};
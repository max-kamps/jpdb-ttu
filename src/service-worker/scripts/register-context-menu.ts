chrome.contextMenus.create({
  id: 'parse-selection',
  title: 'Parse selected text',
  contexts: ['selection'],
});
chrome.contextMenus.create({
  id: 'parse-page',
  title: 'Parse page',
  contexts: ['page'],
});

const listeners: string[] = ['parse-selection', 'parse-page'];

// chrome.contextMenus.onClicked.addListener(async (info, tab) => {
//   const id = info.menuItemId as string;

//   if (!tab || !listeners.includes(id)) {
//     return;
//   }

//   // await prepareParser(tab.id);

//   switch (id) {
//     case 'parse-page':
//       await requestParsePage(tab.id);
//       // const selector = await getParseSelector(tab);
//       // const isParsingDisabled = await isParsingDisabledOnThisPage(tab);

//       // await parsePage(tab, isParsingDisabled ? '.ajb-auto-parse-disable' : selector);

//       break;
//     case 'parse-selection':
//       await parseSelection(tab);

//       break;
//   }
// });

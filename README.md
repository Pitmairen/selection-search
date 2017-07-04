# Selection Search

This is the code for the [Selection Search](https://chrome.google.com/webstore/detail/selection-search/gipnlpdeieaidmmeaichnddnmjmcakoe) chrome extension.


https://chrome.google.com/webstore/detail/selection-search/gipnlpdeieaidmmeaichnddnmjmcakoe 



## Changelog

*0.8.20
- Fixed bug in Keyboard+Mouse activator where the popup would trigger without holding the keyboard key when returning to the page 
after the page lost focus because of certain keyboard shortcuts. (thanks to @bijancamp)
- Improved icon quality for users with high density display. (thanks to @bijancamp)

*0.8.19*
- Added option to open searches in incognito mode

*0.8.18*
- Fixed bug where an erroneous colon (:) was added to the end of the HOST_NAME variable when using the context menu search

*0.8.17*
- Added a blacklist to be able to disable the popup on specific sites

*0.8.16*
- Fixed POST searches in new versions of chrome. A change in Chrome version 56 and newer broke the POST search.

*0.8.15*
- Fixed bug introduced in the last release that caused the icons to disappear

*0.8.14*
- Added option to set a limit on the length of the selection that will activate the popup

*0.8.13*
- Fix visual bug in search engine list on options page
- Fix bug in context menu when used the "openall" option
- Fix separator alignment in icon only styles
- Added option to sort search engines by usage count

*0.8.12*
- Fix POST searches which are no linger double urlencoded
- Remove the the {%-s} added in the previouse release which is no longer needed

*0.8.11*
- Added new placeholder that don't encode spaces {%-s}

*0.8.10*
- Added option to show the popup directly without the button when using the auto activator. (thanks to @bijancamp)
- Added option to configure how the popup is repositioned when it hits the edge of the window. This can be configured using CSS config options. (thanks to @bijancamp)
- Some changes to the circular menu

*0.8.9*
- Add experimental circular menu

*0.8.8*
- Treat content editable elements the same as textareas and input elements (thanks to @bijancamp)
- Add option to show tooltips when hovering the search engines in the popup
- Fix for sub menus not showing first item when using the "No selection" style

*0.8.7* 
- Add option to position the auto popup button relative to the mouse
- Fix preview of the auto popup button on options page

*0.8.6* 
- Try to reload icons if they don't load the first time

*0.8.5* 
- Revert the old way where the popup would not open when there was a newline in the selection.
- Prevent the menu from wrapping when the menu hits the edge of the page. (Does not update custom styles)
- Set default text direction to left to right.


*0.8.4* 
- Fix loading of sub menu icons.
- Fix styling of sub menus. The css has also changed a little bit
  so custom styling may need to be updated.

*0.8.3* 
- Fix icon scaling.

*0.8.2* 
- Fix bug in the icon loading introduced in the previous version.

*0.8.1* 
- Big rewrite of a lot of the code. It now uses a shadow DOM to prevent interference to/from the page
  where the popup is inserted. The code should also be cleaner.
- Fix for extension breaking search in the pdfviewer.
- The way the icons are loaded have changed so there should no longer be warings about unsafe content on https pages. So the option to remove icons from https pages was removed.
- Prevent links from opening when selection is on a link.

*0.7.26:*
- Fix popup preview on options page
- Fix icon alignment

*0.7.25:*
- Allow to run on file:// urls.
- Make copy work in sub menus when open all is clicked.

*0.7.24:*
- Added option to use multiple activators.

*0.7.23:*
- Added possibility to specify if a new tab should be opened in the background or foreground for individual search engines.

*0.7.21/22:*
- Added additional placeholder "{%+s}" that replaces spaces with +
- Changed the way the search engines are stored to increase the number of search engines that can be synced. 

*0.7.20:*
- Add option to disable javascript effects. (Fade in/out of popup menu) 

*0.7.19:*
- Add better error message. 

*0.7.18:*
- Fixed POST searches. 

*0.7.17:*
- Removed unneeded permissions. The tabs and clipboard was not  actually needed.

*0.7.16:*
- Added option to modified the position of tabs when opening a new tab.

*0.7.15:*
- Added a COPY option to copy selection to the clipboard. (See under "More variables" on the options page)
- Added an option to open the popup on double click. (Under "Advanced settings")

*0.7.14:*
- Added CURRENT_DOMAIN as a variable to the icon url. The favicon from the current domain will be used.

*0.7.13:*
- Added synchronization of search engines and settings

*0.7.12:*
- Fix mycroft search
- Update to manifest version 2

*0.7.11:*
- Updated jquery

*0.7.10:*
- Added option to disable the CTRL+ALT+click shortcut for adding search engines. It can sometimes be buggy so if you don't use it you can now disable it.

*0.7.9:*
- Make the search engines in the popup menu open in background tabs if "Open search in background tab" is checked.
- Added %PAGE_QUERY_STRING and %PAGE_QS_VAR(name) variables. (Only useful for advanced usage)

*0.7.8:*
- Added option to close popup after click on a search engine. You find it under "Popup Menu" at the bottom of "Advanced Settings".

*0.7.6, 0.7.7:*
- Changed the way icons are loaded to prevent it from affecting the page load time.

*0.7.4, 0.7.5:*
- Fixed bug in newer versions of chrome.

*0.7.3:*
- Fixed mycroft.mozdev.org bug.

*0.7.2:*
- Added option to open all search engines in a submenu.

*0.7.1:*
- Added submenus
- Added separators
- ** If the submenus or separators don't look correct, you should try to reload 
  you menu style. You can reload the style by reselecting the style you are using and save.**

*0.6.0:*
- Separated the context menu and the popup. They can now be used simultaneously.

*0.5.9:*
- Fixed bug with "Show in inputs and textareas" option, introduced by chrome 11.

*0.5.8:*
- Added more search-url variables: %PAGE_HOST, %PAGE_URL, %PAGE_ORIGIN

*0.5.7:*
- Fix to prevent breaking evernote.com

*0.5.6:*
- Fix error with export of settings when settings contains special characters.

*0.5.5:*
- Added export and import of settings and search engines

*0.5.4:*
- POST engines should now work a little better and they now also work with the context-menu option.

*0.5.3:*
- Fix for problem with POST engines with Chrome 9.

*0.5.2:*
- Added a new menu activation method. You can now configure a keyboard shortcut + a mouse button to activate the menu. For example Ctrl+left click, Ctrl+Shift+right click etc.

*0.5.1:*
- Fixed failing acid3 test
- Fixed "Insert Image" lab feature in Gmail.
- Changed options styling

*0.5.0:*
- Added option to show the search engines in the context menu (right click menu). It can be changed in the options under "Menu Activation".

*0.4.5:*
- Its now possible to select text in inputs and textareas and do a search. You have to CTRL+click inside the input or textarea to show the popup.

*0.4.4:*
- Small change to allow opening of urls with the special search engine: "%s"

*0.4.3:*
- It should now work better with sites that use different encodings, but it's not 100% perfect.

*0.4.2:*
- Added option to remove icons from popup to prevent insecure content warnings.
- It now works better on pages that use frames.

*0.4.1:*
- Search engines that are using the POST method is now supported.
- New search engines can be added by holding ctrl+alt and clicking on the search input in a form
- The selected text can now be edited in the popup.

*0.3.2:*
- Added reordering of the search engines

*0.3.1:*
- It's now possible to add search engines from http://mycroft.mozdev.org

*0.2.2:*
- Some small changes

*0.2.1:*
- Added option to automatically open menu when text is selected.
- Some other changes and it should work much better now.

*0.1.6:*
- doubleclick selection with left button should work now

*0.1.5:*
- fixed error in version 0.1.4

*0.1.4:*
- Added option to open search in new tab

*0.1.3:*
- Now it works better when text is selected with double click (but only when middle click is used to activate menu)
- Added some predefined styles in the options page

*0.1.2:*
- Changed how the custom css is added


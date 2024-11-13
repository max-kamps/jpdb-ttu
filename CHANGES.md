# Version ＋α 1.5

I'm hoping there's nothing else major I need to change before I release the video about this (but also I hope there's nothing major I need to fix AFTER I release it lol)

- Move links on parsed text into the popup and turn it on by default (I may change this to being off by default but for now I like it on at the start)
- Add link to learn page when on the last page of 2D reviews
- Add progress bar to top of review & learn screens
- Add options to prioritize popup to show on top or to the right of the word (for easier reviewing & reading)
- Add Mokuro support for mokuro.moe
- Clean up like a million little bugs and visual oddities

# Version ＋α 1.4

This will hopefully be the final version before the "release" - still in the branch but will be merged someday lol

- Pull JPDB words from the lookup-vocabulary endpoint using word IDs so there should be no more mis-parses on jpdb.io pages!
  - Still needs major cleanup and debugging, the popup window is way off where it should be like 40% of the time

# Version ＋α 1.3

Some more small improvements (basically me just procrastinating before I have to change the last big thing before "release" lol)

- Add links to learn new word pages in the JPDB home and learn pages! Click those to be taken to an auto-parsed page of your all-word/global deck ordered by frequency across the whole corpus
- Add ability to switch the JPDB buttons to be on the bottom of the popup (defaulted to this but may switch if people don't like it
- Add ability to have successfully-graded words hide in 2D reviews! not sure I'd use this myself but it's really satisfying
- Add new settings related to new functionality
- Add progress message to 2D reviews (done_count / remaining_count)

# Version ＋α 1.2

Small fix that improves the QOL of mobile reviewing 10x

- Fixed popup positioning so the popup will (should) never be bigger than the screen
- Prevent webpage from extending randomly across the x-axis when the popup is large
- Some other small fixes that I forgot about but they're probably important

# Version ＋α 1.1

Added:

- Links to take you to the 2D review page on home and learn pages
- Blank space to push down 2D reviews for a less overwhelming experience
- Added setting to disable blank space
- Added custom logo! Pretty basic and not good looking but it'll do for now lol

# Version ＋α 1.0

Adding first functionality for 2D reviewing (from https://jpdb.io/deck?id=global)

- Automatically parse JPDB all vocab deck page
- Add custom styling to JPDB global/all vocab deck page to hide answers and align vocab words for 2D reviewing
- Auto-hide field-sets and info on all vocab deck page and add button to toggle visibility
- Auto-hide overlay after a passing review (hard, good, or easy) attached to item
- Add custom CSS as default config (easily removable if it's unwanted, will streamline in the future)
- Remove links on global deck page to allow for mobile breading

# Version 13

It's been a while since the last update, hasn't it...

- Replaced annoying browser popups with toast (hehe) notifications
  - Toasts close automatically after some time, and can also be closed manually with the x button
  - Feedback on the mobile experience wanted
- Added experimental support for parsing YouTube subtitles Thanks @xyaman)
- Added support for the ZXY101 Mokuro fork (thanks @rymiel)
- Bugfixes:
  - Several

# Version 12.1

- Bugfixes:
  - Fix permission-related bugs that stop custom CSS from working in Chrome, among other things

# Version 12.0

- Add Bunpro integration (thanks @7w1)
- Bugfixes:
  - Fixed popups being positioned incorrectly, especially on pages with vertical text

# Version 11.0

- Show new part of speech information in the word popup
- Limit popup height, make it scrollable
- Allow mouse buttons to be chosen as hotkeys
- Add support for showing popup without hotkey (thanks @xyaman)
- Add experimental mobile support (thanks @xyaman and @Calonca)
- Add a button to parse the whole page in the reader menu (thanks @Calonca)
- Add a button to select text when parsing websites through the reader menu (useful on mobile) (thanks @Calonca)
- Add exSTATIc integration (thanks @asayake-b5)
- Add renji-xd integration (thanks @asayake-b5)
- Add YouTube subtitle integration (thanks @xyaman)
- Completely redone visual design
- Change to a more useful version numbering scheme
- Rename plugin to jpd-breader to avoid confusing people on the Discord
- Bugfixes:
  - Fixed selection parsing not working on certain webpages due to "Reached end of document" errors
  - Fixed parsing not working on certain webpages due to "Unknown display value -webkit-box" errors

## Breaking changes

Popup CSS: `.mine-buttons` has now been split into `#mine-buttons` and `#review-buttons`

## Note

This version adds support for the new jpdb API position encoding system. If you do not update to this version, your extension will stop working.

# Version 0.0.10

- Added functionality to import and export settings
- Bugfixes, notably:
  - Fixed incorrect pitch rendering for words with a rise/fall immediately followed by a fall/rise
  - Fixed custom CSS not reloading properly sometimes after saving settings

# Version 0.0.9

- Added hotkeys for quick mining and showing the advanced mining dialog
- Added pitch accent to the popup
- Bugfixes (notably #13, and incorrect spacing on justified text in Chrome)

# Version 0.0.8

- New "Add" button in the popup that adds a word to your mining deck in one click
- Moved old modal dialog to a new "Edit, add and review..." button
- Added new settings to control whether the Add button should add to forq, and how many sentences it should mine
- Bugfixes (notably #26)

# Version 0.0.7

- Added Readwok integration (thank you @sdbversini)
- Parsing, especially while scrolling, should now send fewer API request
- Added support for more epubs in ttu
- Bugfixes (notably #24 and #25)

# Version 0.0.6

- Hotkeys are now keyboard layout independent
- You can hit escape to clear a hotkey (no hover mode yet though)
- Bugfixes

## Manual intervention required

The format hotkeys are saved in has changed. Installing this version will reset all of your hotkeys.

# Version 0.0.5

- Added integrations for Wikipedia, Mokuro, and Texthookers (Thanks @sdbversini)
- Bugfixes (notably #8, #20)

# Version 0.0.4

- Popup now closes when you press the hotkey again while not hovering over a word
- Bugfixes (notably #16)

# Version 0.0.3

- Added frequency information to the popup (thanks @nico-abram)
- Reworked the settings page to be much more usable
- Added hotkeys for blacklisting, never-forgetting, reviewing
- Popup now only shows up when holding down a hotkey
- Bugfixes (including #2, #3, #5, #6, #7, #10)

# Version 0.0.2

- Reduced the time that adding reviews takes
- Bugfixes

# Version 0.0.1

- Initial release

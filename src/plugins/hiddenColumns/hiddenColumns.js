import BasePlugin from './../_base.js';
import {
  addClass
} from './../../helpers/dom/element.js';
import {registerPlugin, getPlugin} from './../../plugins.js';

/**
 * @class HiddenColumns
 * @plugin HiddenColumns
 */
class HiddenColumns extends BasePlugin {
  constructor(hotInstance) {
    super(hotInstance);

    if (!this.hot.getSettings().hiddenColumns) {
      return;
    }

    this.settings = null;
    this.hiddenColumns = [];
    this.initPlugin();
  }


  initPlugin() {
    this.settings = this.hot.getSettings().hiddenColumns;
    if (typeof this.settings !== 'boolean') {
      if (this.settings.copyPasteEnabled === void 0) {
        this.settings.copyPasteEnabled = true;

      }
    }

    this.bindHooks();
  }

  bindHooks() {
    this.hot.addHook('beforeInit', () => this.onBeforeInit());
    this.hot.addHook('afterGetCellMeta', (row, col, cellProperties) => this.onAfterGetCellMeta(row, col, cellProperties));
    this.hot.addHook('modifyColWidth', (width, col) => this.onModifyColWidth(width, col));
    this.hot.addHook('modifyCopyableColumnRange', (ranges) => this.onModifyCopyableColumnRange(ranges));
    this.hot.addHook('afterGetColHeader', (col, TH) => this.onAfterGetColHeader(col, TH));
  }

  onBeforeInit() {
    if (typeof this.settings === 'boolean') {
      return;
    }

    if(this.settings.columns) {
      this.hideColumns(this.settings.columns);
    }
  }

  onModifyCopyableColumnRange(ranges) {
    if (typeof this.settings === 'boolean') {
      return;
    }

    if (this.settings.copyPasteEnabled) {
      return ranges;
    }

    let newRanges = [];

    for (let i = 0, rangeCount = ranges.length; i < rangeCount; i++) {
      let partial = this.splitCopyableRange(ranges[i]);

      for (var j = 0; j < partial.length; j++) {
        newRanges.push(partial[j]);
      }
    }

    return newRanges;
  }

  splitCopyableRange(range) {
    let splitRanges = [];
    let newStart = range.startCol;
    let isHidden = (i) => (this.hiddenColumns[i]);

    for (let i = range.startCol; i <= range.endCol; i++) {

      if (isHidden(i) && i !== range.startCol) {

        if (isHidden(i - 1)) {
          continue;
        }

        splitRanges.push({
          startRow: range.startRow,
          endRow: range.endRow,
          startCol: Math.max(range.startCol, newStart),
          endCol: i - 1
        });

      } else if (isHidden(i - 1)) {
        newStart = i;

      }

      if (!isHidden(i) && i === range.endCol) {
        splitRanges.push({
          startRow: range.startRow,
          endRow: range.endRow,
          startCol: Math.max(range.startCol, newStart),
          endCol: i
        });
      }

    }

    return splitRanges;
  }

  onAfterGetColHeader(col, TH) {
    if (typeof this.settings === 'boolean') {
      return;
    }

    if (!this.settings.indicators || this.hiddenColumns[col]) {
      return;
    }

    if (this.hiddenColumns[col - 1]) {
      addClass(TH, 'afterHiddenColumn');
    }

    if (this.hiddenColumns[col + 1]) {
      addClass(TH, 'beforeHiddenColumn');
    }
  }

  hideColumns(elements) {
    for (let i = 0, elemCount = elements.length; i < elemCount; i++) {
      if (typeof elements[i] === 'number') {
        this.hiddenColumns[elements[i]] = true;

      } else if (typeof elements[i] === 'object') {
        hideColumns(elements[i]);
      }
    }
  }

  onAfterGetCellMeta(row, col, cellProperties) {
    if (typeof this.settings === 'boolean') {
      return;
    }

    if (this.settings.copyPasteEnabled === false && this.hiddenColumns[col]) {
      cellProperties.copyable = false;
      cellProperties.skipColumnOnPaste = true;
    }

    if (this.hiddenColumns[col - 1]) {
      let firstSectionHidden = true;
      let i = col - 1;

      cellProperties.className = cellProperties.className || '' + ' afterHiddenColumn';

      do {
        if (!this.hiddenColumns[i]) {
          firstSectionHidden = false;
          break;
        }
        i--;
      } while (i >= 0);

      if (firstSectionHidden && cellProperties.className.indexOf('firstVisible') === -1) {
        cellProperties.className += ' firstVisible';
      }

    }
  }

  onModifyColWidth(width, col) {
    if (typeof this.settings === 'boolean' && this.hiddenColumns.length === 0) {
      return;
    }

    if (this.hiddenColumns[col]) {
      return 0.1;
    } else if (this.settings.indicators && (this.hiddenColumns[col + 1] || this.hiddenColumns[col - 1])) {

      // add additional space for hidden column indicator
      return width + 15;
    }
  }

}

export {HiddenColumns};

registerPlugin('hiddenColumns', HiddenColumns);

Handsontable.plugins.HiddenColumns = HiddenColumns;
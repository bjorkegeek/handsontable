import {
  addClass,
  fastInnerText,
  isVisible,
  removeClass,
} from './../../../helpers/dom/element';
import {objectEach} from './../../../helpers/object';
import {toUpperCaseFirst, randomString} from './../../../helpers/string';
import {WalkontableEvent} from './event';
import {WalkontableOverlays} from './overlays';
import {WalkontableScroll} from './scroll';
import {WalkontableSettings} from './settings';
import {WalkontableTable} from './table';
import {WalkontableViewport} from './viewport';
import {WalkontableOverlay} from './overlay/_base.js';
import {WalkontableTopOverlay} from './overlay/top.js';
import {WalkontableLeftOverlay} from './overlay/left.js';
import {WalkontableBottomOverlay} from './overlay/bottom.js';
import {WalkontableRightOverlay} from './overlay/right.js';
import {WalkontableDebugOverlay} from './overlay/debug.js';
import {WalkontableTopLeftCornerOverlay} from './overlay/topLeftCorner.js';
import {WalkontableBottomLeftCornerOverlay} from './overlay/bottomLeftCorner.js';
import {WalkontableTopRightCornerOverlay} from './overlay/topRightCorner.js';
import {WalkontableBottomRightCornerOverlay} from './overlay/bottomRightCorner.js';

/**
 * @class Walkontable
 */
class Walkontable {
  /**
   * @param {Object} settings
   */
  constructor(settings) {
    let originalHeaders = [];

    // this is the namespace for global events
    this.guid = 'wt_' + randomString();

    // bootstrap from settings
    if (settings.cloneSource) {
      this.cloneSource = settings.cloneSource;
      this.cloneOverlay = settings.cloneOverlay;
      this.wtSettings = settings.cloneSource.wtSettings;
      this.wtTable = new WalkontableTable(this, settings.table, settings.wtRootElement);
      this.wtScroll = new WalkontableScroll(this);
      this.wtViewport = settings.cloneSource.wtViewport;
      this.wtEvent = new WalkontableEvent(this);
      this.selections = this.cloneSource.selections;
    } else {
      this.wtSettings = new WalkontableSettings(this, settings);
      this.wtTable = new WalkontableTable(this, settings.table);
      this.wtScroll = new WalkontableScroll(this);
      this.wtViewport = new WalkontableViewport(this);
      this.wtEvent = new WalkontableEvent(this);
      this.selections = this.getSetting('selections');
      this.wtOverlays = new WalkontableOverlays(this);
      this.exportSettingsAsClassNames();
    }

    // find original headers
    if (this.wtTable.THEAD.childNodes.length && this.wtTable.THEAD.childNodes[0].childNodes.length) {
      for (let c = 0, clen = this.wtTable.THEAD.childNodes[0].childNodes.length; c < clen; c++) {
        originalHeaders.push(this.wtTable.THEAD.childNodes[0].childNodes[c].innerHTML);
      }
      if (!this.getSetting('columnHeaders').length) {
        this.update('columnHeaders', [
          function(column, TH) {
            fastInnerText(TH, originalHeaders[column]);
          }
        ]);
      }
    }
    this.drawn = false;
    this.drawInterrupted = false;
  }

  /**
   * Force rerender of Walkontable
   *
   * @param {Boolean} [fastDraw=false] When `true`, try to refresh only the positions of borders without rerendering
   *                                   the data. It will only work if WalkontableTable.draw() does not force
   *                                   rendering anyway
   * @returns {Walkontable}
   */
  draw(fastDraw = false) {
    this.drawInterrupted = false;

    if (!fastDraw && !isVisible(this.wtTable.TABLE)) {
      // draw interrupted because TABLE is not visible
      this.drawInterrupted = true;
    } else {
      this.wtTable.draw(fastDraw);
    }

    return this;
  }

  /**
   * Returns the TD at coords. If topmost is set to true, returns TD from the topmost overlay layer,
   * if not set or set to false, returns TD from the master table.
   *
   * @param {WalkontableCellCoords} coords
   * @param {Boolean} [topmost=false]
   * @returns {Object}
   */
  getCell(coords, topmost = false) {
    if (!topmost) {
      return this.wtTable.getCell(coords);
    }

    let totalRows = this.wtSettings.getSetting('totalRows');
    let totalColumns = this.wtSettings.getSetting('totalColumns');
    let fixedRowsTop = this.wtSettings.getSetting('fixedRowsTop');
    let fixedRowsBottom = this.wtSettings.getSetting('fixedRowsBottom');
    let fixedColumnsLeft = this.wtSettings.getSetting('fixedColumnsLeft');
    let fixedColumnsRight = this.wtSettings.getSetting('fixedRowsBottom');

    let vDir;
    if (coords.row < fixedRowsTop) {
      vDir = 't';
    } else if (coords.row >= totalRows - fixedRowsBottom) {
      vDir = 'b';
    } else {
      vDir = 'c';
    }
    let hDir;
    if (coords.col < fixedColumnsLeft) {
      hDir = 'l';
    } else if (coords.col >= totalColumns - fixedColumnsRight) {
      hDir = 'r';
    } else {
      hDir = 'c';
    }
    let table;
    switch (vDir + hDir) {
      case 'tl': table = this.wtOverlays.topLeftCornerOverlay.clone.wtTable; break;
      case 'tr': table = this.wtOverlays.topRightCornerOverlay.clone.wtTable; break;
      case 'tc': table = this.wtOverlays.topOverlay.clone.wtTable; break;
      case 'cl': table = this.wtOverlays.leftOverlay.clone.wtTable; break;
      case 'cc': table = this.wtTable; break;
      case 'cr': table = this.wtOverlays.rightOverlay.clone.wtTable; break;
      case 'bl': table = this.wtOverlays.bottomLeftCornerOverlay.clone.wtTable; break;
      case 'bc': table = this.wtOverlays.bottomOverlay.clone.wtTable; break;
      case 'br': table = this.wtOverlays.bottomRightCornerOverlay.clone.wtTable; break;
    }
    return table.getCell(coords);
  }

  /**
   * @param {Object} settings
   * @param {*} value
   * @returns {Walkontable}
   */
  update(settings, value) {
    return this.wtSettings.update(settings, value);
  }

  /**
   * Scroll the viewport to a row at the given index in the data source
   *
   * @param {Number} row
   * @returns {Walkontable}
   */
  scrollVertical(row) {
    this.wtOverlays.topOverlay.scrollTo(row);
    this.getSetting('onScrollVertically');

    return this;
  }

  /**
   * Scroll the viewport to a column at the given index in the data source
   *
   * @param {Number} column
   * @returns {Walkontable}
   */
  scrollHorizontal(column) {
    this.wtOverlays.leftOverlay.scrollTo(column);
    this.getSetting('onScrollHorizontally');

    return this;
  }

  /**
   * Scrolls the viewport to a cell (rerenders if needed)
   *
   * @param {WalkontableCellCoords} coords
   * @returns {Walkontable}
   */
  scrollViewport(coords) {
    this.wtScroll.scrollViewport(coords);

    return this;
  }

  /**
   * @returns {Array}
   */
  getViewport() {
    return [
      this.wtTable.getFirstVisibleRow(),
      this.wtTable.getFirstVisibleColumn(),
      this.wtTable.getLastVisibleRow(),
      this.wtTable.getLastVisibleColumn()
    ];
  }

  /**
   * Get overlay name
   *
   * @returns {String}
   */
  getOverlayName() {
    return this.cloneOverlay ? this.cloneOverlay.type : 'master';
  }

  /**
   * Export settings as class names added to the parent element of the table.
   */
  exportSettingsAsClassNames() {
    let toExport = {
      rowHeaders: ['array'],
      columnHeaders: ['array']
    };
    let allClassNames = [];
    let newClassNames = [];

    objectEach(toExport, (optionType, key) => {
      if (optionType.indexOf('array') > -1 && this.getSetting(key).length) {
        newClassNames.push('ht' + toUpperCaseFirst(key));
      }
      allClassNames.push('ht' + toUpperCaseFirst(key));
    });
    removeClass(this.wtTable.wtRootElement.parentNode, allClassNames);
    addClass(this.wtTable.wtRootElement.parentNode, newClassNames);
  }

  /**
   * Get/Set Walkontable instance setting
   *
   * @param {String} key
   * @param {*} [param1]
   * @param {*} [param2]
   * @param {*} [param3]
   * @param {*} [param4]
   * @returns {*}
   */
  getSetting(key, param1, param2, param3, param4) {
    // this is faster than .apply - https://github.com/handsontable/handsontable/wiki/JavaScript-&-DOM-performance-tips
    return this.wtSettings.getSetting(key, param1, param2, param3, param4);
  }

  /**
   * Checks if setting exists
   *
   * @param {String} key
   * @returns {Boolean}
   */
  hasSetting(key) {
    return this.wtSettings.has(key);
  }

  /**
   * Destroy instance
   */
  destroy() {
    this.wtOverlays.destroy();
    this.wtEvent.destroy();
  }
}

export {Walkontable};

window.Walkontable = Walkontable;


import {
  outerHeight,
  outerWidth,
  setOverlayPosition,
  getScrollbarHeight,
} from './../../../../helpers/dom/element';
import {WalkontableOverlay} from './_base';

/**
 * @class WalkontableBottomLeftCornerOverlay
 */
class WalkontableBottomLeftCornerOverlay extends WalkontableOverlay {
  /**
   * @param {Walkontable} wotInstance
   */
  constructor(wotInstance) {
    super(wotInstance);
    this.clone = this.makeClone(WalkontableOverlay.CLONE_BOTTOM_LEFT_CORNER);
  }

  /**
   * Checks if overlay should be fully rendered
   *
   * @returns {Boolean}
   */
  shouldBeRendered() {
    return this.wot.getSetting('fixedRowsBottom') &&
        (this.wot.getSetting('fixedColumnsLeft') || this.wot.getSetting('rowHeaders').length) ? true : false;
  }

  /**
   * Updates the corner overlay position
   */
  resetFixedPosition() {
    if (!this.wot.wtTable.holder.parentNode) {
      // removed from DOM
      return;
    }
    let overlayRoot = this.clone.wtTable.holder.parentNode;
    let tableHeight = outerHeight(this.clone.wtTable.TABLE);
    let tableWidth = outerWidth(this.clone.wtTable.TABLE);

    if (this.trimmingContainer === window) {
      let box = this.wot.wtTable.hider.getBoundingClientRect();
      let top = Math.ceil(box.top);
      let left = Math.ceil(box.left);
      let bottom = Math.ceil(box.bottom);
      let right = Math.ceil(box.right);
      let finalLeft;
      let finalTop;

      if (left < 0 && (right - overlayRoot.offsetWidth) > 0) {
        finalLeft = -left + 'px';
      } else {
        finalLeft = '0';
      }

      if (top < 0 && (bottom - overlayRoot.offsetHeight) > 0) {
        finalTop = -top + 'px';
      } else {
        finalTop = '0';
      }
      setOverlayPosition(overlayRoot, finalLeft, finalTop);
    }
    overlayRoot.style.height = (tableHeight === 0 ? tableHeight : tableHeight + 4) + 'px';
    overlayRoot.style.width = (tableWidth === 0 ? tableWidth : tableWidth + 4) + 'px';
    if (this.wot.wtOverlays.leftOverlay.trimmingContainer !== window) {
      let scrollBarHeight = getScrollbarHeight();
      setOverlayPosition(overlayRoot, '0px',
          this.wot.wtViewport.getWorkspaceHeight() -
          scrollBarHeight - tableHeight + 'px');
    }
  }
}

export {WalkontableBottomLeftCornerOverlay};

window.WalkontableBottomLeftCornerOverlay = WalkontableBottomLeftCornerOverlay;

WalkontableOverlay.registerOverlay(WalkontableOverlay.CLONE_BOTTOM_LEFT_CORNER, WalkontableBottomLeftCornerOverlay);


import {
  outerHeight,
  outerWidth,
  setOverlayPosition,
  getScrollbarWidth,
  getScrollbarHeight,
} from './../../../../helpers/dom/element';
import {WalkontableOverlay} from './_base';

/**
 * @class WalkontableBottomRightCornerOverlay
 */
class WalkontableBottomRightCornerOverlay extends WalkontableOverlay {
  /**
   * @param {Walkontable} wotInstance
   */
  constructor(wotInstance) {
    super(wotInstance);
    this.clone = this.makeClone(WalkontableOverlay.CLONE_BOTTOM_RIGHT_CORNER);
  }

  /**
   * Checks if overlay should be fully rendered
   *
   * @returns {Boolean}
   */
  shouldBeRendered() {
    return this.wot.getSetting('fixedRowsBottom') &&
        (this.wot.getSetting('fixedColumnsRight') || this.wot.getSetting('rowHeaders').length) ? true : false;
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
      let finalRight;
      let finalTop;

      if (right < 0 && (right - overlayRoot.offsetWidth) > 0) {
        finalRight = -right + 'px';
      } else {
        finalRight = '0';
      }

      if (top < 0 && (bottom - overlayRoot.offsetHeight) > 0) {
        finalTop = -top + 'px';
      } else {
        finalTop = '0';
      }
      setOverlayPosition(overlayRoot, finalRight, finalTop);
    }
    overlayRoot.style.height = (tableHeight === 0 ? tableHeight : tableHeight + 4) + 'px';
    overlayRoot.style.width = (tableWidth === 0 ? tableWidth : tableWidth + 4) + 'px';
    if (this.wot.wtOverlays.rightOverlay.trimmingContainer !== window) {
      let scrollBarWidth = getScrollbarWidth();
      let scrollBarHeight = getScrollbarHeight();
      setOverlayPosition(overlayRoot,
          this.wot.wtViewport.getWorkspaceWidth() -
          scrollBarWidth -
          outerWidth(this.clone.wtTable.TABLE) + 'px',
          this.wot.wtViewport.getWorkspaceHeight() -
          scrollBarHeight -
          outerHeight(this.clone.wtTable.TABLE) + 'px');
    }
  }
}

export {WalkontableBottomRightCornerOverlay};

window.WalkontableBottomRightCornerOverlay = WalkontableBottomRightCornerOverlay;

WalkontableOverlay.registerOverlay(WalkontableOverlay.CLONE_BOTTOM_RIGHT_CORNER, WalkontableBottomRightCornerOverlay);

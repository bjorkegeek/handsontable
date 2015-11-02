import {addClass, removeClass} from './../../helpers/dom/element';
import BasePlugin from './../_base';
import {registerPlugin} from './../../plugins';

/**
 * @private
 * @plugin TouchScroll
 * @class TouchScroll
 */
class TouchScroll extends BasePlugin {
  /**
   * @param {Handsontable} hotInstance
   */
  constructor(hotInstance) {
    super(hotInstance);

    this.hot.addHook('afterInit', () => this.afterInit());
    this.hot.addHook('afterUpdateSettings', () => this.onAfterUpdateSettings());
    this.scrollbars = [];
    this.clones = [];
  }

  /**
   * Initialize plugin
   */
  afterInit() {
    this.registerEvents();
    this.onAfterUpdateSettings();
  }

  onAfterUpdateSettings() {
    var _this = this;

    // Wait for the overlays to render and update their .needFullRender property
    this.hot.addHookOnce('afterRender', function() {
      let wtOverlays = _this.hot.view.wt.wtOverlays;

      _this.scrollbars = [];
      _this.scrollbars.push(wtOverlays.topOverlay);

      if (wtOverlays.bottomOverlay.clone) {
        _this.scrollbars.push(wtOverlays.bottomOverlay);
      }
      _this.scrollbars.push(wtOverlays.leftOverlay);
      if (wtOverlays.rightOverlay.clone) {
        _this.scrollbars.push(wtOverlays.rightOverlay);
      }

      if (wtOverlays.topLeftCornerOverlay) {
        _this.scrollbars.push(wtOverlays.topLeftCornerOverlay);
      }

      if (wtOverlays.bottomLeftCornerOverlay && wtOverlays.bottomLeftCornerOverlay.clone) {
        _this.scrollbars.push(wtOverlays.bottomLeftCornerOverlay);
      }

      if (wtOverlays.topRightCornerOverlay && wtOverlays.topRightCornerOverlay.clone) {
        _this.scrollbars.push(wtOverlays.topRightCornerOverlay);
      }

      if (wtOverlays.bottomRightCornerOverlay && wtOverlays.bottomRightCornerOverlay.clone) {
        _this.scrollbars.push(wtOverlays.bottomRightCornerOverlay);
      }

      _this.clones = [];

      if (wtOverlays.topOverlay.needFullRender) {
        _this.clones.push(wtOverlays.topOverlay.clone.wtTable.holder.parentNode);
      }
      if (wtOverlays.bottomOverlay.needFullRender) {
        _this.clones.push(wtOverlays.bottomOverlay.clone.wtTable.holder.parentNode);
      }
      if (wtOverlays.leftOverlay.needFullRender) {
        _this.clones.push(wtOverlays.leftOverlay.clone.wtTable.holder.parentNode);
      }
      if (wtOverlays.rightOverlay.needFullRender) {
        _this.clones.push(wtOverlays.rightOverlay.clone.wtTable.holder.parentNode);
      }
      if (wtOverlays.topLeftCornerOverlay) {
        _this.clones.push(wtOverlays.topLeftCornerOverlay.clone.wtTable.holder.parentNode);
      }
      if (wtOverlays.bottomLeftCornerOverlay && wtOverlays.bottomLeftCornerOverlay.clone) {
        _this.clones.push(wtOverlays.bottomLeftCornerOverlay.clone.wtTable.holder.parentNode);
      }
      if (wtOverlays.topRightCornerOverlay && wtOverlays.topRightCornerOverlay.clone) {
        _this.clones.push(wtOverlays.topRightCornerOverlay.clone.wtTable.holder.parentNode);
      }
      if (wtOverlays.bottomRightCornerOverlay && wtOverlays.bottomRightCornerOverlay.clone) {
        _this.clones.push(wtOverlays.bottomRightCornerOverlay.clone.wtTable.holder.parentNode);
      }
    });
  }

  /**
   * Register all necessary events
   */
  registerEvents() {
    this.hot.addHook('beforeTouchScroll', () => this.onBeforeTouchScroll());
    this.hot.addHook('afterMomentumScroll', () => this.onAfterMomentumScroll());
  }

  /**
   * Touch scroll listener
   */
  onBeforeTouchScroll() {
    Handsontable.freezeOverlays = true;

    for (let i = 0, cloneCount = this.clones.length; i < cloneCount; i++) {
      addClass(this.clones[i], 'hide-tween');
    }
  }

  /**
   * After momentum scroll listener
   */
  onAfterMomentumScroll() {
    Handsontable.freezeOverlays = false;
    var _that = this;

    for (let i = 0, cloneCount = this.clones.length; i < cloneCount; i++) {
      removeClass(this.clones[i], 'hide-tween');
    }

    for (let i = 0, cloneCount = this.clones.length; i < cloneCount; i++) {
      addClass(this.clones[i], 'show-tween');
    }

    setTimeout(function() {
      for (let i = 0, cloneCount = _that.clones.length; i < cloneCount; i++) {
        removeClass(_that.clones[i], 'show-tween');
      }
    }, 400);

    for (let i = 0, cloneCount = this.scrollbars.length; i < cloneCount; i++) {
      this.scrollbars[i].refresh();
      this.scrollbars[i].resetFixedPosition();
    }
    this.hot.view.wt.wtOverlays.syncScrollWithMaster();
  }
}

export {TouchScroll};

registerPlugin('touchScroll', TouchScroll);


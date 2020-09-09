/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   lib/utils/mixin.html
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.

/// <reference path="boot.d.ts" />

declare namespace Polymer {


  /**
   * Wraps an ES6 class expression mixin such that the mixin is only applied
   * if it has not already been applied its base argument. Also memoizes mixin
   * applications.
   */
  function dedupingMixin<T>(mixin: T): T;
}

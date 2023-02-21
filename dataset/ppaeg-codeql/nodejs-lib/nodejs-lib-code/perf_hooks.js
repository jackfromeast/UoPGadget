'use strict';

const {
  ObjectDefineProperty,
} = primordials;

const {
  constants,
} = internalBinding('performance');

const { PerformanceEntry } = require('internal/perf/performance_entry');
const {
  PerformanceObserver,
  PerformanceObserverEntryList,
} = require('internal/perf/observe');
const {
  PerformanceMark,
  PerformanceMeasure,
} = require('internal/perf/usertiming');
const { InternalPerformance } = require('internal/perf/performance');

const {
  createHistogram
} = require('internal/histogram');

const monitorEventLoopDelay = require('internal/perf/event_loop_delay');

module.exports = {
  PerformanceEntry,
  PerformanceMark,
  PerformanceMeasure,
  PerformanceObserver,
  PerformanceObserverEntryList,
  monitorEventLoopDelay,
  createHistogram,
  performance: new InternalPerformance(),
};

ObjectDefineProperty(module.exports, 'constants', {
  configurable: false,
  enumerable: true,
  value: constants
});

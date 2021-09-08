/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export interface CommandMetric {
    extensionName: string;
    commandName: string;
    executionTime?: string;
  }
  
  export interface Measurements {
    [key: string]: number;
  }
  
  export interface Properties {
    [key: string]: string;
  }
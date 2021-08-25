/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as util from 'util';
import { ExtensionContext, workspace } from 'vscode';
import { TelemetryReporter } from './telemetryReporter';
import { CommandMetric, Measurements, Properties } from './types';

export class TelemetryService {
  private static instance: TelemetryService;
  private context: ExtensionContext | undefined;
  private reporter: TelemetryReporter | undefined;
  private aiKey = '';
  private version = '';
  private extensionName = 'unknown';

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  /**
   * Initialize Telemetry Service during extension activation.
   * @param context extension context
   * @param extensionName extension name
   */

  public async initializeService(
    context: ExtensionContext,
    extensionName: string,
    aiKey: string,
    version: string,
    machineId: string
  ): Promise<void> {
    this.context = context;
    this.extensionName = extensionName;
    this.aiKey = aiKey;
    this.version = version;

    const isDevMode = machineId === 'someValue.machineId';

    // TelemetryReporter is not initialized if user has disabled telemetry setting.
    if (
      this.reporter === undefined &&
      this.isTelemetryExtensionConfigurationEnabled() &&
      !isDevMode
    ) {
      try {
        this.reporter = new TelemetryReporter(
          'salesforce-docs-markdown-preview',
          this.version,
          this.aiKey,
          true
        );
        this.context.subscriptions.push(this.reporter);
      } catch (e) {
        console.error(
          `Error initializing telemetry on Salesforce Docs Markdown extension: ${e.message}`
        );
      }
    }
  }

  public getReporter(): TelemetryReporter | undefined {
    return this.reporter;
  }

  public isTelemetryExtensionConfigurationEnabled(): boolean {
    return (
      workspace
        .getConfiguration('telemetry')
        .get<boolean>('enableTelemetry', true) &&
      workspace
        .getConfiguration('salesforce-docs-markdown-preview')
        .get<boolean>('enableTelemetry', true)
    );
  }

  public sendExtensionActivationEvent(hrstart: [number, number]): void {
    const startupTime = this.getEndHRTime(hrstart);
    this.reporter?.sendTelemetryEvent(
      'activationEvent',
      {
        extensionName: this.extensionName,
      },
      { startupTime }
    );
  }

  public sendExtensionDeactivationEvent(): void {
    this.reporter?.sendTelemetryEvent('deactivationEvent', {
      extensionName: this.extensionName,
    });
  }

  public sendCommandEvent(
    commandName?: string,
    hrstart?: [number, number],
    properties?: Properties,
    measurements?: Measurements
  ): void {
    if (commandName) {
      const baseProperties: CommandMetric = {
        extensionName: this.extensionName,
        commandName,
      };
      const aggregatedProps = Object.assign(baseProperties, properties);

      let aggregatedMeasurements: Measurements | undefined;
      if (hrstart || measurements) {
        aggregatedMeasurements = Object.assign({}, measurements);
        if (hrstart) {
          aggregatedMeasurements.executionTime = this.getEndHRTime(hrstart);
        }
      }
      this.reporter?.sendTelemetryEvent(
        'commandExecution',
        aggregatedProps,
        aggregatedMeasurements
      );
    }
  }

  public sendException(name: string, message: string): void {
    this.reporter?.sendExceptionEvent(name, message);
  }

  public sendEventData(
    eventName: string,
    properties?: Properties,
    measures?: Measurements
  ): void {
    this.reporter?.sendTelemetryEvent(eventName, properties, measures);
  }

  public getEndHRTime(hrstart: [number, number]): number {
    const hrend = process.hrtime(hrstart);
    return Number(util.format('%d%d', hrend[0], hrend[1] / 1000000));
  }

  public dispose(): void {
    if (this.reporter !== undefined) {
      this.reporter.dispose().catch((err) => console.log(err));
    }
  }
}
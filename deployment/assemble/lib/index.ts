/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  AwsLogDriver,
  Cluster,
  Compatibility,
  ContainerImage,
  FargateService,
  TaskDefinition
} from 'aws-cdk-lib/aws-ecs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface AssembleProps {
  cluster: Cluster;
}

export class Assemble extends Construct {
  containerName = 'assemble';
  containerPort = 3002;
  service: FargateService;

  constructor(scope: Construct, id: string, { cluster }: AssembleProps) {
    super(scope, id);

    // Create a task definition that contains both the application and cache containers.
    const taskDefinition = new TaskDefinition(this, 'SmartFormsAssembleTaskDefinition', {
      compatibility: Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '1024'
    });

    // Create the cache container.
    taskDefinition.addContainer('SmartFormsAssembleContainer', {
      containerName: this.containerName,
      image: ContainerImage.fromRegistry('aehrc/smart-forms-assemble:latest'),
      portMappings: [{ containerPort: this.containerPort }],
      logging: AwsLogDriver.awsLogs({
        streamPrefix: 'smart-forms-assemble',
        logRetention: RetentionDays.ONE_MONTH
      })
    });

    this.service = new FargateService(this, 'SmartFormsAssembleService', {
      cluster,
      taskDefinition
    });
  }
}

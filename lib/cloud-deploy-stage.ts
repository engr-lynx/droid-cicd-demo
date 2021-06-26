import { Construct, Stage, StageProps } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import { MobileConf } from './context-helper';
import { RepoPlayPipelineStack } from './repo-play-pipeline-stack';

export interface CloudDeployProps extends StageProps {
  cacheBucket: Bucket,
}

/**
 * Deployable unit of entire architecture
 */
export class CloudDeployStage extends Stage {

  constructor(scope: Construct, id: string, cloudDeployProps: CloudDeployProps) {
    super(scope, id, cloudDeployProps);
    const mobileContext = this.node.tryGetContext('mobile');
    const mobileConf = mobileContext as MobileConf;
    new RepoPlayPipelineStack(this, 'DroidPipeline', {
      ...mobileConf.droid.pipeline,
      cacheBucket: cloudDeployProps.cacheBucket,
    });
  }

}

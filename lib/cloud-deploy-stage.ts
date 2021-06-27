import { Construct, Stage, StageProps } from '@aws-cdk/core';
import { MobileConf } from './context-helper';
import { RepoPlayPipelineStack } from './repo-play-pipeline-stack';

interface CloudDeployProps extends StageProps {
  cacheBucketArn?: string,
}

/**
 * Deployable unit of entire architecture
 */
export class CloudDeployStage extends Stage {

  constructor(scope: Construct, id: string, cloudDeployProps?: CloudDeployProps) {
    super(scope, id, cloudDeployProps);
    const mobileContext = this.node.tryGetContext('mobile');
    const mobileConf = mobileContext as MobileConf;
    new RepoPlayPipelineStack(this, 'DroidPipeline', {
      ...mobileConf.droid.pipeline,
      cacheBucketArn: cloudDeployProps?.cacheBucketArn,
    });
  }

}

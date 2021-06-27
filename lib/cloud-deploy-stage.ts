import { Construct, Stage, StageProps } from '@aws-cdk/core';
import { MobileConf } from './context-helper';
import { RepoPlayPipelineStack } from './repo-play-pipeline-stack';

/**
 * Deployable unit of entire architecture
 */
export class CloudDeployStage extends Stage {

  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);
    const mobileContext = this.node.tryGetContext('mobile');
    const mobileConf = mobileContext as MobileConf;
    new RepoPlayPipelineStack(this, 'DroidPipeline', {
      ...mobileConf.droid.pipeline,
    });
  }

}

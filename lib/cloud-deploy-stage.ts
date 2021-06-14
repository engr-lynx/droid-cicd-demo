import { Construct, Stage, StageProps } from '@aws-cdk/core';
import { PipelineCacheStack } from './pipeline-cache-stack';
import { MobileConf } from './context-helper';
import { RepoPlayPipelineStack } from './repo-play-pipeline-stack';

/**
 * Deployable unit of entire architecture
 */
export class CloudDeployStage extends Stage {

  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);
    const pipelineCache = new PipelineCacheStack(this, 'PipelineCache');
    const mobileContext = this.node.tryGetContext('mobile');
    const mobileConf = mobileContext as MobileConf;
    new RepoPlayPipelineStack(this, 'DroidPipeline', {
      ...mobileConf.droid.pipeline,
      cacheBucket: pipelineCache.bucket,
    });
  }

}

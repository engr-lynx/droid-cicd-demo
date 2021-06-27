import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import { Pipeline } from '@aws-cdk/aws-codepipeline';
import { ManualApprovalAction, CodeBuildActionType, S3DeployAction } from '@aws-cdk/aws-codepipeline-actions';
import { PipelineConf } from './context-helper';
import { buildRepoSourceAction, buildDroidBuildAction, buildCustomAction } from './pipeline-helper'

export interface RepoPlayPipelineProps extends StackProps, PipelineConf {}

export class RepoPlayPipelineStack extends Stack {

  constructor(scope: Construct, id: string, repoPlayPipelineProps: RepoPlayPipelineProps) {
    super(scope, id, repoPlayPipelineProps);
    const cacheBucket = new Bucket(this, 'CacheBucket');
    const pipelineStages = [];
    const { action: repoAction, sourceCode } = buildRepoSourceAction(this, {
      ...repoPlayPipelineProps.repo,
    });
    const sourceStage = {
      stageName: 'Source',
      actions: [
        repoAction,
      ],
    };
    pipelineStages.push(sourceStage);
    const prefix = id + 'Build';
    const { action: buildAction, apkFiles } = buildDroidBuildAction(this, {
      ...repoPlayPipelineProps.build,
      prefix,
      sourceCode,
      cacheBucket,
    });
    const buildStage = {
      stageName: 'Build',
      actions: [
        buildAction,
      ],
    };
    pipelineStages.push(buildStage);
    /* Todo:
     * optional stages (in order from build) - staging (register-task-definition), deploy, staging cleanup (stop task)
     */
    if (repoPlayPipelineProps.test) {
      const prefix = id + 'Test';
      const { action: testAction } =  buildCustomAction(this, {
        ...repoPlayPipelineProps.test,
        prefix,
        type: CodeBuildActionType.TEST,
        input: sourceCode,
        cacheBucket,
      });
      const testStage = {
        stageName: 'Test',
        actions: [
          testAction,
        ],
      };
      pipelineStages.push(testStage);
    };
    if (repoPlayPipelineProps.validate) {
      const approvalAction = new ManualApprovalAction({
        actionName: 'Approval',
        notifyEmails: repoPlayPipelineProps.validate.emails,
      });
      const validateStage = {
        stageName: 'Validate',
        actions: [
          approvalAction,
        ],
      };
      pipelineStages.push(validateStage);
    };
    if (repoPlayPipelineProps.deploy) {
      const deployBucket = new Bucket(this, 'DeployBucket');
      const deployAction = new S3DeployAction({
        actionName: 'S3Deploy',
        input: apkFiles,
        bucket: deployBucket,
      });
      const deployStage = {
        stageName: 'Deploy',
        actions: [
          deployAction,
        ],
      };
      pipelineStages.push(deployStage);  
    }
    // const deployPolicy = new PolicyStatement({
    //   effect: Effect.ALLOW,
    //   actions: [
    //     'lambda:UpdateFunctionCode',
    //   ],
    //   resources: [
    //     repoPlayPipelineProps.func.functionArn,
    //   ],
    // });
    // const deployCode = Code.fromAsset(join(__dirname, 'sls-cont-deploy-handler'));
    // const deployHandler = new Function(this, 'DeployHandler', {
    //   runtime: Runtime.PYTHON_3_8,
    //   handler: 'slsdeploy.on_event',
    //   code: deployCode,
    //   timeout: Duration.minutes(1),
    //   logRetention: RetentionDays.ONE_DAY,
    //   initialPolicy: [
    //     deployPolicy,
    //   ],
    // });
    // contRepo.grant(deployHandler,
    //   'ecr:SetRepositoryPolicy',
    //   'ecr:GetRepositoryPolicy',
    //   'ecr:InitiateLayerUpload'
    // );
    // const userParameters = {
    //   funcName: repoPlayPipelineProps.func.functionName,
    //   repoUri: contRepo.repositoryUri + ':latest',
    // };
    // const slsDeploy = new LambdaInvokeAction({
    //   actionName: 'SlsDeploy',
    //   lambda: deployHandler,
    //   userParameters: deployProps,
    // });
    // const deployStage = {
    //   stageName: 'Deploy',
    //   actions: [
    //     slsDeploy,
    //   ],
    // };
    // pipelineStages.push(deployStage);
    new Pipeline(this, 'RepoPlayPipeline', {
      stages: pipelineStages,
      restartExecutionOnUpdate: false,
    });
  }

}

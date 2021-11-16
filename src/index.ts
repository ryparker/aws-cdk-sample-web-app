import { App, Stack } from 'aws-cdk-lib';
import createBasicWebAppSampleStack from './stacks/basic-web-app-sample'


const app = new App();

const stack = new Stack(app, 'BasicWebAppSample');
createBasicWebAppSampleStack(stack);

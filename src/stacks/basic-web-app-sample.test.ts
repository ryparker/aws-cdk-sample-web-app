import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import createBasicWebAppSampleStack from './basic-web-app-sample';

test('creates one bucket, when stack is synthesized', () => {
  const stack = new Stack();

  createBasicWebAppSampleStack(stack);

  const assert = Template.fromStack(stack);
  assert.resourceCountIs('AWS::S3::Bucket', 1);
});

test('bucket is configured for hosting a static site, when stack is synthesized', () => {
  const stack = new Stack();

  createBasicWebAppSampleStack(stack);

  const assert = Template.fromStack(stack);
  assert.hasResourceProperties('AWS::S3::Bucket', {
    WebsiteConfiguration: {
      IndexDocument: 'index.html',
      ErrorDocument: 'error.html',
    },
  });
});

test('creates a CloudFront Origin Access Identity (OAI), when stack is synthesized', () => {
  const stack = new Stack();

  createBasicWebAppSampleStack(stack);

  const assert = Template.fromStack(stack);
  assert.resourceCountIs('AWS::CloudFront::CloudFrontOriginAccessIdentity', 1);
});


test('creates one CloudFront distribution, when stack is synthesized', () => {
  const stack = new Stack();

  createBasicWebAppSampleStack(stack);

  const assert = Template.fromStack(stack);
  assert.resourceCountIs('AWS::CloudFront::Distribution', 1);
});

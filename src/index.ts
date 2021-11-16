import { App, Stack, RemovalPolicy } from '@aws-cdk/core';
import { Bucket, BlockPublicAccess } from '@aws-cdk/aws-s3';
import {
  Distribution,
  PriceClass,
  HttpVersion,
  SecurityPolicyProtocol,
  GeoRestriction,
  AllowedMethods,
  CachePolicy,
  OriginRequestPolicy,
  ViewerProtocolPolicy,
  OriginAccessIdentity
} from '@aws-cdk/aws-cloudfront';
import { S3Origin } from '@aws-cdk/aws-cloudfront-origins';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';


const app = new App();
const stack = new Stack(app, 'BasicWebAppSample');

const siteBucket = new Bucket(stack, 'SiteBucket', {
  websiteIndexDocument: 'index.html',
  websiteErrorDocument: 'error.html',
  publicReadAccess: false,
  blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
  removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
  autoDeleteObjects: true, // NOT recommended for production code
});

const cloudfrontOAI = new OriginAccessIdentity(stack, 'CloudfrontOAI', {
  comment: `OAI for BasicWebAppSample`,
});

const siteBucketOrigin = new S3Origin(siteBucket, {
  originAccessIdentity: cloudfrontOAI,
});

const distribution = new Distribution(stack, 'Distribution', {
  comment: 'BasicWebAppSample',
  enabled: true,
  priceClass: PriceClass.PRICE_CLASS_100,
  enableIpv6: true,
  httpVersion: HttpVersion.HTTP2,
  minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
  geoRestriction: GeoRestriction.allowlist('US'),
  defaultRootObject: 'index.html',
  defaultBehavior: {
    origin: siteBucketOrigin,
    allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
    cachePolicy: CachePolicy.CACHING_OPTIMIZED,
    originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
    viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    compress: true,
  },
});

new BucketDeployment(stack, 'DeployWithInvalidation', {
  sources: [Source.asset('./site-contents')],
  destinationBucket: siteBucket,
  distribution,
  distributionPaths: ['/*'],
});

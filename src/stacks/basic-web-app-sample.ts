import { Construct, RemovalPolicy, CfnOutput } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import {
  Distribution,
  PriceClass,
  HttpVersion,
  SecurityPolicyProtocol,
  AllowedMethods,
  CachePolicy,
  OriginRequestPolicy,
  OriginAccessIdentity
} from '@aws-cdk/aws-cloudfront';
import { S3Origin } from '@aws-cdk/aws-cloudfront-origins';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { PolicyStatement, CanonicalUserPrincipal } from '@aws-cdk/aws-iam';


export default (scope: Construct) => {
  const siteBucket = new Bucket(scope, 'SiteBucket', {
    websiteIndexDocument: 'index.html',
    websiteErrorDocument: 'error.html',
    removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
    autoDeleteObjects: true, // NOT recommended for production code
  });

  const cloudfrontOAI = new OriginAccessIdentity(scope, 'CloudfrontOAI', {
    comment: `OAI for BasicWebAppSample`,
  });

  siteBucket.addToResourcePolicy(
    new PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [siteBucket.arnForObjects('*')],
      principals: [
        new CanonicalUserPrincipal(
          cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId,
        ),
      ],
    }),
  );

  const siteBucketOrigin = new S3Origin(siteBucket, {
    originAccessIdentity: cloudfrontOAI,
  });

  const distribution = new Distribution(scope, 'Distribution', {
    comment: 'BasicWebAppSample',
    enabled: true,
    enableIpv6: true,
    priceClass: PriceClass.PRICE_CLASS_100,
    httpVersion: HttpVersion.HTTP2,
    minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
    defaultRootObject: 'index.html',
    defaultBehavior: {
      origin: siteBucketOrigin,
      allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
      cachePolicy: CachePolicy.CACHING_OPTIMIZED,
      originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
      compress: true,
    },
  });

  // Upload the site files to S3 bucket and invalidate CloudFront distribution.
  new BucketDeployment(scope, 'DeployWithInvalidation', {
    sources: [Source.asset('./site-contents')],
    destinationBucket: siteBucket,
    distribution,
    distributionPaths: ['/*'],
  });

  /* Stack Outputs */
  new CfnOutput(scope, 'DistributionUrl', {
    value: distribution.distributionDomainName
  })
  new CfnOutput(scope, 'StaticSiteBucket', {
    value: siteBucket.bucketName
  })
}

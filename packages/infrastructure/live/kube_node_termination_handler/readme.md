# aws-node-termination-handler

This modules deploys the [aws-node-termination-handler](https://github.com/aws/aws-node-termination-handler)
which is used to ensure pods are evicted from nodes in the face of incoming terminations.

We utilize the SQS implementation.

See the [vars file](./vars.tf) for descriptions of the input parameters.

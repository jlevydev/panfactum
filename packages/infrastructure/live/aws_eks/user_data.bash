#!/bin/bash
set -o xtrace

# Install the latest SSM agent
sudo yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm

# Start the SSM Agent
sudo systemctl enable amazon-ssm-agent
sudo systemctl start amazon-ssm-agent

# Connect to the EKS cluster
/etc/eks/bootstrap.sh ${cluster_name} --use-max-pods false --kubelet-extra-args "--max-pods=110 --node-labels node.kubernetes.io/class=${class}"

echo "Completed!"
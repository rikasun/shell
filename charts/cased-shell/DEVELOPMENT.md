# Internal Development Docs

## Overview

### Easy mode

Validates everything, installs the chart locally, forwards ports, prints URL, tails logs. `^c` and re-run to revalidate and update.

```shell
yarn charts
```

### Lint and Test

VS Code:

- Tasks: Run Task
  - Run charts build

```shell
yarn run charts:build
# Observe status of long-running tests with:
kubectl get events -w --all-namespaces
kubectl get pods --all-namespaces -w
kubectl logs -n <namespace> <pod> -f
```

### Install / Update / View Locally

VS Code:

- Tasks: Run Task
  - Run charts sever

```shell
yarn run charts:server
```

### Remove

```shell
yarn run charts:uninstall
```

### Observe status

```shell
kubectl get pods -w
kubectl get events -w
until kubectl logs deploy/shell-dev-cased-shell-v3  -c cased-shell -f 2>/dev/null; do printf .; sleep 5; done
```

### Access current install

```shell
yarn charts:port-forward
```

## Demo installs

### AWS

Configure AWS\_\* environment variables for access to our EKS cluster, then:

#### Install on AWS

##### Community

```shell
KUBECONFIG=.devcontainer/kubeconfig/test-cased-eks.yaml .devcontainer/script/charts-install .devcontainer/helm/aws-example.yaml ./charts/cased-shell/
```

Validate https://helm-v2-aws-example.test-cased-eks.preview-8.com (v2)

###### Enterprise

Login for a customer from https://vendor.replicated.com/apps/cased-shell/customers (`unstable`, `stable`, and `beta` all depending on what you want to install), then:

```shell
KUBECONFIG=.devcontainer/kubeconfig/test-cased-eks.yaml .devcontainer/script/charts-install .devcontainer/helm/aws-example.yaml oci://registry.replicated.com/cased-shell
```

https://helm-v2-aws-example.test-cased-eks.preview-8.com (v2)

###### AWS ALB Validation

```shell
KUBECONFIG=.devcontainer/kubeconfig/test-cased-eks.yaml NAMESPACE=alb-example .devcontainer/script/charts-install .devcontainer/helm/alb-example.yaml oci://registry.replicated.com/cased-shell
```

https://helm-alb-example.test-cased-eks.preview-8.com (v1)

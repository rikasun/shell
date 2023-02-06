# Development container

## Usage

Use the VS Code command palette (`Cmd+Shift+P`) to start the server:

  > Tasks: Run Build Task

Alternatively, press `Cmd+Shift+B` to run this task directly.

This task will print access instructions.

## Tips and tricks

### Web / iPad usage

Codespaces works great in Safari or Chrome ([with a few caveats](https://code.visualstudio.com/docs/remote/codespaces#_known-limitations-and-adaptations)). For the best experience on your iPad:

- Create a Codespace.
- Open it in a browser tab.
- Tap the Share button, then tap Add to Home Screen.
- Tap the new icon on the Home Screen to connect to this Codespace.
- Login and develop as normal.

### You can have more than one Codespace

Need to compare behavior between two branches? Spin up two Codespaces! We're only billed while they are in use.

### Testing changes to the monorepo

Adding a `docker:pr-image` label to any monorepo Pull Request - even a draft PR - will create docker images for that PR tagged with `:pr-$N`. Once built, updating the devcontainer's [`./docker-compose.yml`](./docker-compose.yml) to refer to these image and rebuilding the devcontainer will allow you to preview how changes to the monorepo affect Shell. A helper script is included to set all of this up for you:

```
.devcontainer/script/test-monorepo-pr 31
```

<img width="878" alt="image" src="https://user-images.githubusercontent.com/47/153447433-171b4749-5d6c-4dfe-b450-e563bb387ba2.png">

### Stopping or resetting

`.devcontainer/script/stop` stops the containers while retaining data.
`.devcontainer/script/reset` blows everything away for a fresh setup.
`docker system prune` removes images and containers that are no longer in use.

### Port forwarding

Codespaces [docs about port forwarding](https://docs.github.com/en/codespaces/developing-in-codespaces/forwarding-ports-in-your-codespace) explain how to update the permissions on a shared port to allow others in the organization *or* the public to access the instance of Shell running in your Codespace. This is useful for demos!

### Using Docker from the VS Code Terminal

Volume mounts should use the `LOCAL_WORKSPACE_FOLDER` environment variable to determine their path on the host.

```
docker run -it --rm -v "${LOCAL_WORKSPACE_FOLDER//\\/\/}:/workspace" debian bash
```

## Troubleshooting

### Port forwarding errors

If you see an 502, 503, 504, or other error message when trying to access your forwarded ports, try switching the *visibility* of that port to *Private to Public* as documented [here](https://docs.github.com/en/codespaces/developing-in-codespaces/forwarding-ports-in-your-codespace#sharing-a-port). This seems to remind Codespaces that they should keep forwarding the ports. If port forwarding is still not working, delete and recreate your codespace.

### :exclamation: Rebuilding devcontainers on Codespaces currently breaks port forwarding

Avoid running the following command, which is known to break port forwarding:

> Codespaces: Rebuild container

Alternatively, stop your [existing codespace](https://github.com/cased/shell/codespaces) and recreate it.

### Run into something weird? Still stuck?

[Open an issue](https://github.com/cased/shell/issues/new?labels=devcontainer) and we'll get it figured out!

## Development

### Testing

[`./script/test`](./script/test) builds the current devcontainer [`./docker-compose.yml`](./docker-compose.yml) configuration and performs a few [assertions](./docker-compose.test.yml) to confirm that everything is functional.

#### Manual testing

Please manually test all changes on all supported environments:

- GitHub Codespaces
  - Create a new Codespace, run build task
  - Disconnect / reconnect, run build task
  - Stop / start, run build task
- VS Code Remote Containers
  - Reset, reopen in container, run build task
  - Reopen locally, Reopen in container
  - Reopen locally, rebuild and reopen in container

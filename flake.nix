{
  description = "Local dev shell for resume validation tooling";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22
            pnpm
            git
          ];

          CHROMIUM_PATH = "/run/current-system/sw/bin/google-chrome-stable";

          shellHook = ''
            export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
            echo "Resume dev shell ready."
            echo "Run: pnpm install && pnpm test:print-fit"
          '';
        };
      });
}

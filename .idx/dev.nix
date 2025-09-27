{ pkgs, ... }: {
  channel = "stable-24.05";

  packages = [
    pkgs.pnpm
    pkgs.nodejs_latest
  ];

  env = {
    NODE_ENV = "development";
  };

  idx = {
    extensions = [
      "Vue.volar"
      "Vue.vscode-typescript-vue-plugin"
      "dbaeumer.vscode-eslint"
      "stylelint.vscode-stylelint"
      "bradlc.vscode-tailwindcss"
      "emmanuelbeziat.vscode-great-icons"
      "oderwat.indent-rainbow"
      "RooVeterinaryInc.roo-cline"
      "usernamehw.errorlens"
    ];

    previews = {
      enable = true;
      previews = {
        web = {
          command = ["pnpm" "dev"];
          manager = "web";
          env = {
            PORT = "$PORT";
          };
        };
      };
    };

    workspace = {
      onCreate = {
        install = "pnpm add -g pnpm";
      };
      onStart = {
        dev = "pnpm dev";
      };
    };
  };
}

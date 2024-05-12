import toSource from "tosource";
import type { Plugin } from "rollup";
import { createFilter, makeLegalIdentifier } from "@rollup/pluginutils";
import { compileAsync } from "sass";
import { transform as lightCss } from "lightningcss";
import browersTarget from "./browserslist";

const defaults = {
  documentMode: "single",
  transform: null,
  extensions: [".scss", ".css"],
};

interface Options {
  include?: string[];
  exclude?: string[];
}

export default function css(opts = {}): Plugin {
  const options = Object.assign({}, defaults, opts);
  const { extensions } = options;

  return {
    name: "css",

    async transform(content, id) {
      if (!extensions.some((ext) => id.toLowerCase().endsWith(ext)))
        return null;

      let data = content;

      if (id.toLowerCase().endsWith(".scss")) {
        data = (await compileAsync(id)).css;
      }

      data = lightCss({
        code: Buffer.from(data),
        minify: true,
        sourceMap: false,
        targets: browersTarget,
        filename: id,
      }).code.toString();

      const code = `var data = ${toSource(data)};\n\n`;
      const exports = ["export default data;"];

      return {
        code: code + exports,
        map: { mappings: "" },
      };
    },
  };
}

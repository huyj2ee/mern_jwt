const Env = {
  getInt: function(variable: string): number {
    const strResult: string = process.env[variable] ? process.env[variable] as string : '0';
    return parseInt(strResult, 10)
  },

  getStr: function(variable: string): string {
    const obj: string | undefined = process.env[variable]
    return obj === undefined ? '' : obj as string;
  }
};

export default Env;
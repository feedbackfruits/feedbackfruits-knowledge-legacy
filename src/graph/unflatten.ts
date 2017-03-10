import * as flat from 'flat';

const ID = 'id';

module Path {
  export function fromString(str: string, delimiter: string = '.') {
    return str.split(delimiter);
  }

  export function toString(path: string[], delimiter: string = '.') {
    return path.join(delimiter);
  }
}

function addToObject(obj, key, value) {
  let path = Path.fromString(key);
  let { length } = path;
  return path.reduce((memo, p, i) => {
    if (!(p in memo)) {
      if (i === length - 1) {
        memo[p] = value;
        return memo;
      } else {
        memo[p] = {};
        return memo[p];
      }

    }
  }, obj);
}

function mergeObjects<T>(result: T, other: T, cache: Array<T> = []): T {
  return Object.keys(result).reduce<T>((memo, key) => {
    let value = result[key];
    let otherValue = other[key];

    if (value instanceof Array || otherValue instanceof Array) {
      memo[key] = [].concat(value, otherValue);
    }
    else if (value instanceof Object && otherValue instanceof Object) {
      if (!(ID in value)) {
        throw new Error(`Result doesn't have ${ID} attribute: ${JSON.stringify(value)}`);
      }
      else if (value[ID] !== otherValue[ID]) {
        memo[key] = [].concat(value, otherValue);
      }
      else {
        memo[key] = mergeObjects(<T>value, <T>otherValue);
      }
    }
    else if (value != otherValue) {
      throw new Error(`Values are native and do not match for key '${key}': '${value}' and '${otherValue}'`);
    }
    else {
      memo[key] = value;
    }

    return memo;
  }, <any>{});
}

function mergeResultsWithResult<T>(results: Array<T>, result: T): Array<T> {
  console.log(`Merging results with result:`, results, result);

  if (results.length === 0) return [ mergeObjects(result, result) ];
  else if (results.length === 1) {
    try {
      return [ mergeObjects(results[0], result) ];
    } catch(e) {
      // debugger;
      return [].concat(results, mergeObjects(result, result));
    }
  }
  else {
    let found = results.find(res => res[ID] === result[ID]);
    if (!found) return [].concat(results, result);
    let index = results.indexOf(found);
    let merged = mergeObjects<T>(found, result)
    let res = [].concat(results);
    res.splice(index, 1, merged);
    return res;
  }
}

function mergeResults<T>(results: Array<T>, merged: Array<T>) {
  console.log(`Merging results:`, results, merged);
  return results.reduce((memo, result) => {
    console.log(`Merging result:`, result);
    if (memo.length === 0) return [ result ];
    return mergeResultsWithResult(memo, result);
  }, merged);
}

export default function processResults<T>(results: Array<T>) {
  console.log(`Unflattening...`);
  if (!results) return null;
  let unflattened = results.map(obj => {
    let clone = Object.assign({}, obj);
    delete clone[ID];
    return clone;
  }).map(flat.unflatten);
  return mergeResults(unflattened, []);
}

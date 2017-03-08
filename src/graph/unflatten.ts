import * as flat from 'flat';

// const results = require('../../results.json');

/**
Convert something like:
```
[
  {
    "id": "<http://academic.microsoft.com/#/detail/138885662>",
    "topic.description": "Linguistics is the scientific study of language, and involves an analysis of language form, language meaning, and language in context. The earliest activities in the documentation and description of language have been attributed to the 4th century BCE Indian grammarian Pāṇini who wrote a formal description of the Sanskrit language in his Aṣṭādhyāyī.",
    "topic.id": "<http://academic.microsoft.com/#/detail/41895202>",
    "topic.parents.id": "<http://academic.microsoft.com/#/detail/138885662>",
    "topic.thumbnail": "http://blog.accredited-online-colleges.com/wp-content/uploads/2012/05/Linguistics-TS.jpg"
  },
  {
    "id": "<http://academic.microsoft.com/#/detail/144024400>",
    "topic.description": "Linguistics is the scientific study of language, and involves an analysis of language form, language meaning, and language in context. The earliest activities in the documentation and description of language have been attributed to the 4th century BCE Indian grammarian Pāṇini who wrote a formal description of the Sanskrit language in his Aṣṭādhyāyī.",
    "topic.id": "<http://academic.microsoft.com/#/detail/41895202>",
    "topic.parents.id": "<http://academic.microsoft.com/#/detail/144024400>",
    "topic.thumbnail": "http://blog.accredited-online-colleges.com/wp-content/uploads/2012/05/Linguistics-TS.jpg"
  }
]
```
to something like:
```
{
  topic: {
    id
    description
    thumbnail
    parents: [
      {
        id
        description
        thumbnail
      },
      {
        id
        description
        thumbnail
      }
    ]
  }
}
```
**/

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
  // return results.reduce((memo, value) => {
    // debugger;

    // let merged = mergeObjects(value, result);
    // return mergeResultsWithResult(memo, result);
    // if (!(ID in value)) {
    //   debugger;
    //   return
    // }
    // else

  //   if (!(ID in value)) {
  //
  //   }
  //   else if (value[ID] === results[ID]) {
  //     memo.push(mergeObjects(value, result));
  //     return memo;
  //   }
  //   else {
  //     return [].concat(memo, value, result);
  //   }
  // }, results);
}

function mergeResults<T>(results: Array<T>, merged: Array<T>) {
  console.log(`Merging results:`, results, merged);
  return results.reduce((memo, result) => {
    console.log(`Merging result:`, result);
    if (memo.length === 0) return [ result ];
    return mergeResultsWithResult(memo, result);
    // let found = memo.find(res => res[ID] === result[ID]);
    // if (!found) return [].concat(memo, result);
    // let index = memo.indexOf(found);
    // let merged = mergeObjects<T>(found, result)
    // memo.splice(index, 1, merged);
    // return memo;
  }, merged);
  // let mergedList = _.map(unflattened, function(item){
  //   return _.extend(item, _.findWhere(a2, { id: item.id }));
  // });
  // return results.reduce((memo, result) => {
    // let keys = Object.keys(result).filter(key => key === ID);
    // keys.map((key) => {
    //   let value = result[key];
    //   return addToObject(memo, key, value);
    // });
  // }, {});
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

// console.log(processResults(<Array<any>>results.result));

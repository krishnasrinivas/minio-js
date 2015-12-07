/*
 * Minio Javascript Library for Amazon S3 Compatible Cloud Storage, (C) 2015 Minio, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Stream from 'stream';
import EventEmitter from 'events'
import * as _ from 'lodash'

export default class MockTransport {
  constructor() {
    this.requests = []
  }

  addRequest(verifyParams, statusCode, responseHeaders, responseStream) {
    var req = new Request()
    req = _.merge(req, {verifyParams, statusCode, responseHeaders, responseStream})
    this.requests.push(req)
  }

  //noinspection JSUnusedGlobalSymbols
  clearRequests() {
    this.requests = []
  }

  request(params, callback) {
    var req = this.requests.shift()
    return new Request(req, params, callback)
  }
}

class Request extends EventEmitter {
  constructor(req, params, callback) {
    super()
    this.req = req
    this.params = params
    this.callback = callback
  }

  //noinspection JSUnusedGlobalSymbols
  end() {
    this._r()
  }

  _r() {
    var stream = new Stream.Readable()
    stream._read = function() {}
    if (this.req.responseStream) {
      this.req.responseStream.pipe(stream)
    } else {
      stream.push(null)
    }
    if (this.req.verifyParams) {
      this.req.verifyParams(this.params)
    }
    if (this.req.statusCode) {
      stream.statusCode = this.req.statusCode
    } else {
      stream.statusCode = 200
    }
    if (this.req.responseHeaders) {
      stream.headers = this.req.responseHeaders
    } else {
      stream.headers = {}
    }
    this.callback(stream)
  }
}

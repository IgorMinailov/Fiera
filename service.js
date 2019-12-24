class Queue {
  /**
   * @param {number} number the requestRate the Queue has per interval
   * @param {number} timeout the total time items are allowed to wait for execution
   * @param {number} interval the interval for the requestRate in seconds
   */
  constructor({ requestRate = 500, interval = 1 } = {}) {
    if (isNaN(interval)) {
      this.timeout = interval;
    }

    this.queue = [];
    this.totalCost = 0;
    this.currentRequestRate = requestRate;
    this.lastRefill = null;

    this.setRequestRate(requestRate);
    this.setTimeout(this.timeout);
    this.setInterval(interval);
  }

  async throttle(cost = 1, append = true, isPause = false) {
    const maxCurrentRequestRate = this.getCurrentMaxRequestRate();

    // if items are added at the beginning, the excess items will be remove later on
    if (append && this.totalCost + cost > maxCurrentRequestRate) {
      throw new Error(`Cannot throttle item, Queue is overflowing: the maximum requestRate is ${maxCurrentRequestRate},
       the current total requestRate is ${this.totalCost}!`);
    }

    return new Promise((resolve, reject) => {
      const item = {
        resolve,
        reject,
        cost,
        isPause
      };
      this.totalCost += cost;

      if (append) {
        this.queue.push(item);
      } else {
        this.queue.unshift(item);
      }

      this.startTimer();
    });
  }

  startTimer() {
    if (!this.timer && this.queue.length > 0) {
      const { cost, resolve } = this.getFirstItem();

      if (this.currentRequestRate >= cost) {
        resolve();

        // remove the item from the queue
        this.shiftQueue();

        this.run(cost);

        // go to the next item
        this.startTimer();
      } else {
        const requiredDelta = cost + this.currentRequestRate * -1;
        const timeToDelta = (requiredDelta / this.refillRate) * 1000;

        // wait until the next item can be handled
        this.timer = setTimeout(() => {
          this.timer = 0;
          this.startTimer();
        }, timeToDelta);
      }
    }
  }

  shiftQueue() {
    this.queue.shift();

    if (this.queue.length === 0 && this.emptyPromiseResolver) {
      this.emptyPromiseResolver();
    }
  }

  async isEmpty() {
    if (!this.emptyPromiseResolver) {
      this.emptyPromise = new Promise(resolve => {
        this.emptyPromiseResolver = () => {
          this.emptyPromiseResolver = null;
          this.emptyPromise = null;
          resolve();
        };
      });
    }

    return this.emptyPromise;
  }

  run(cost) {
    // reduce the current requestRate
    this.currentRequestRate -= cost;

    // keep track of the total requestRate for the Queue
    this.totalCost -= cost;

    // store the date the Queue was starting
    if (this.lastRefill === null) {
      this.lastRefill = Date.now();
    }
  }

  getCurrentMaxRequestRate() {
    return this.maxRequestRate - (this.requestRate - this.currentRequestRate);
  }

  getFirstItem() {
    if (this.queue.length > 0) {
      return this.queue[0];
    } else {
      return null;
    }
  }

  setTimeout(timeout) {
    this.timeout = timeout;
    this.updateVariables();
    return this;
  }

  setInterval(interval) {
    this.interval = interval;
    this.updateVariables();
    return this;
  }

  setRequestRate(requestRate) {
    this.requestRate = requestRate;
    this.updateVariables();
    return this;
  }

  updateVariables() {
    // take one as default for each variable since this method may be called
    this.maxRequestRate =
      ((this.timeout || 1) / (this.interval || 1)) * (this.requestRate || 1);

    // the rate, at which the Queue is filled per second
    this.refillRate = (this.requestRate || 1) / (this.interval || 1);
  }
}

// Main Limiter Class
class RequestLimiter {
  constructor({ requestRate = 60, interval = 1 } = {}) {
    this.requestRate = requestRate;
    this.interval = interval;

    // the Queue is used to limit the requests and allow
    // bursting, like its often done on APIs
    this.queue = new Queue({
      requestRate: this.requestRate,
      interval: this.interval
    });
  }

  async idle() {
    return this.queue.isEmpty();
  }

  async request(requestConfig) {
    const doRequest = async () => {
      // wait for the next free slot, if the request cannot be executed
      // in time, an error will be thrown
      await this.queue.throttle();

      return await this.executeRequest(requestConfig)
        .then(response => response)
        .catch(async () => "Fail");
    };

    return await doRequest();
  }

  async executeRequest(requestConfig) {
    if (!this.requestHandler) {
      throw new Error("No request handler present");
    }

    return await this.requestHandler(requestConfig);
  }

  setRequestHandler(requestHandler) {
    if (typeof requestHandler === "function") {
      this.requestHandler = requestHandler;
    } else if (
      typeof requestHandler === "object" &&
      typeof requestHandler.request === "function"
    ) {
      this.requestHandler = async requestConfig => {
        return await requestHandler.request(requestConfig);
      };
    } else {
      throw new Error("Invalid request handler");
    }
  }
}

exports.RequestLimiter = RequestLimiter;

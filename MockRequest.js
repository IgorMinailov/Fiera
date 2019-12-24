class MockRequest {

  async request(requestConfig) {
    if (requestConfig.action === 'fail') {
      throw new Error('Fail!');
    } else if (requestConfig.action === 'Error' && !requestConfig.counter) {
      requestConfig.counter = 1;
      throw new Error('Error');
    } else {
      return {
        status: 'good',
      }
    }
  }
}

exports.MockRequest = MockRequest;

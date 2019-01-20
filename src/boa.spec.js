const boa = require('./boa');

describe('test boa', () => {
  it('should return an object', () => {
    const cli = boa({
      argv: ['foo', '--foo-bar', '-u', 'cat', '--', 'unicorn', 'cake'],
  		helpText: `
  			Usage
  			  foo <input>
  		`,
  		flags: {
  			unicorn: {alias: 'u'},
  			meow: {default: 'dog'},
  			'--': true
  		}
    });
    console.log(cli);
    expect(cli.input[0]).toEqual('foo');
  });
});

const Mixin = require('../../lib/mixin')

const bot = new Mixin()

let sessionId = 'a0fb24da-a910-4f21-a41e-88accca13523'
let pinToken =
  'Ywh2uHwRvvflGYdDiuFHY6Qob1Jf1gxXX4O9iLbF4QVxHSpqI+LdV02WPqHdtY0g/1S8qJecQdqiD7eSvY2MjHkx5TXxq28d0h7H72u2/QtCUbSbGogYOBL7vA7jpFZsaoJCxkOG1I7uWCpdy/uNQfzFtUY0AuELuVP1HuP/6kw='
let privateKey =
  '-----BEGIN RSA PRIVATE KEY-----\r\nMIICWwIBAAKBgQCC+EsZJvBUxQrqxXDNkSWHheHQWlUkabg/UgFaUKp/swCMzcNW\r\nAq2a2ybl1VpqpFH+3+ahWsEWzrer736uUN1eMVCRvTI66ZMJmV1JYjSOYeqJRT1i\r\nQpkHNvWp+4klKNaO5W39/PUgXSZywXQ5Nj7P7beO8Akt+8uoa/970q78CQIDAQAB\r\nAoGAaNKbIJ1muyId07uExjLGi8pe6qhx/rvSqHNU+9kWLTCyXv+MuLlaA1glsMvr\r\nGvE7YzgG2dvOMRfwL192z8OO+F9a2Y2I4dHsszf4MRjuJ+X5uAWfqyoq695nBzJu\r\nS95jCdb9XCZYyQdGpRSc9S3L42DMypaO5DnvdHPbq1SnCBECQQDH3BtLzPHj+zQn\r\ntHc24l1yBbAiR5hvZfD0Q/sxLvxbGhLOiNBT1dZemb4w2RYG7PrDqWc1naA7cL7C\r\nGqUrJOQlAkEAp8JSm6Y/pvEeNvk+FSq+EA3GzbLAAtBaYb1kqEnRXDcD09IavXl3\r\nHqQSW7NXVbb2Pwk207L3lRDtK9aU2mmhFQJAYNnyRF5xzig60w7qQqeZ3xqQi1wk\r\nq7878DNNdD0vv7o36Ox2AFp9AuUAPM3Gld6betwKDvpu3r85QfkFl43OHQJANCW/\r\nsAqZtrc1ATmxBrtmoW7m4YIzFazWq5NH+tgXcGbZlbq1/TgIw0mVO1QgTdC18xpW\r\nJLB5Lak5UGs/kjVLkQJAQlyKV96B6z3BUoutA1S+z0u6mU3nbRwryKxyT0zlVfvm\r\nobwldb75nCvq3aRY0qeGGF0sElX6xV9BuCMPWLfUXw==\r\n-----END RSA PRIVATE KEY-----\r\n'

console.log(bot.generateSessionKeypair())
// console.log(bot.signAuthenticationToken())
console.log(bot.signEncryptedPin('123456', pinToken, sessionId, privateKey))

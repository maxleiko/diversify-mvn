/**
 * Random number between 0 (included) and max (included)
 * @param  {number} max upper bound
 * @return {number}     random inbounds number
 */
function random(max) {
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - +1));
}

module.exports = random;

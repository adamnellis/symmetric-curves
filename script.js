
// Standard Normal variate using Box-Muller transform.
// From https://stackoverflow.com/a/36481059
function gaussianRandom(mean=0, stdev=1) {
  let u = 1 - Math.random(); //Converting [0,1) to (0,1)
  let v = Math.random();
  let z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}

function main() {
  // Initialise canvas
  const canvas = document.querySelector(".myCanvas");
  const width = canvas.width = window.innerWidth;
  const height = canvas.height = window.innerHeight;

  const ctx = canvas.getContext("2d");

  // Paint background
  ctx.fillStyle = "rgb(230, 230, 230)";
  ctx.fillRect(0, 0, width, height);

  ctx.translate(width / 2, height / 2);

  // Set parameters of curve
  const dimensions = 5
  const steps = 2  //10
  const decay = 1.5 //1.1
  const theta_resolution = 2000
  
  // Calculate coefficients for curve
  const magnitude_coefficients = []
  const angle_coefficients = []
  for (let i=-steps; i<steps; i++) {
	magnitude_coefficients.push(gaussianRandom() / (Math.abs(steps*dimensions + 1) + 0.5)**decay)
	angle_coefficients.push(i*dimensions + 1)
  }
  
  // Calculate points on curve
  const z_real_points = []
  const z_imaginary_points = []
  for (let theta_i=0; theta_i<theta_resolution; theta_i++) {
	const theta = Math.PI*2*theta_i/theta_resolution
	let z_real = 0
	let z_imaginary = 0
	for (const k in magnitude_coefficients) {
      z_real += (magnitude_coefficients[k] * Math.cos(angle_coefficients[k] * theta))
	  z_imaginary += (magnitude_coefficients[k] * Math.sin(angle_coefficients[k] * theta))
	}
	z_real_points.push(z_real)
	z_imaginary_points.push(z_imaginary)
  }
  
  // Scale curve to canvas size
  const padding = 20
  const z_min = Math.min(...z_real_points, ...z_imaginary_points)
  const z_max = Math.max(...z_real_points, ...z_imaginary_points)
  const scale_factor = (Math.min(width, height) - padding) / (z_max - z_min)
  
  const z_real_draw_points = []
  const z_imaginary_draw_points = []
  for (const i in z_real_points) {
	z_real_draw_points.push(z_real_points[i] * scale_factor)
	z_imaginary_draw_points.push(z_imaginary_points[i] * scale_factor)
  }
  
  // Draw curve
  ctx.fillStyle = "rgb(50, 50, 50)"
  ctx.strokeStyle = "rgb(50, 50, 50)"
  ctx.lineWidth = 5
  ctx.beginPath()

  ctx.moveTo(z_real_draw_points[z_real_draw_points.length-1], z_imaginary_draw_points[z_real_draw_points.length-1])
  for (const i in z_real_draw_points) {
    ctx.lineTo(z_real_draw_points[i], z_imaginary_draw_points[i])
  }
  ctx.stroke()

}

main()


// Standard Normal variate using Box-Muller transform.
// From https://stackoverflow.com/a/36481059
function gaussianRandom(mean=0, stdev=1) {
  let u = 1 - Math.random(); //Converting [0,1) to (0,1)
  let v = Math.random();
  let z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}

function makeCurve(steps, dimensions, decay) {
  // Calculate coefficients for curve
  const magnitude_coefficients = []
  const angle_coefficients = []
  for (let i=-steps; i<steps; i++) {
    magnitude_coefficients.push(gaussianRandom() / (Math.abs(steps*dimensions + 1) + 0.5)**decay)
    angle_coefficients.push(i*dimensions + 1)
  }
  return {magnitude_coefficients, angle_coefficients}
}

function main() {
  // Initialise canvas
  const canvas = document.querySelector(".myCanvas");
  const width = canvas.width = window.innerWidth;
  const height = canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");
  
  // Move canvas origin to the centre
  ctx.translate(width / 2, height / 2);

  // Set parameters of curve
  const dimensions = 5
  const steps = 2  //10
  const decay = 1.5 //1.1
  
  // Set reslution of drawing
  const theta_resolution = 2000  // number of straight line segments approximating the curve
  const interpolation_resolution = 100  // number of time steps animating between each curve end point
  const interpolation_timestep = 100  // milliseconds between each animation frame
  
  // Create initial curve end points
  let curve_1 = null
  let curve_2 = makeCurve(steps, dimensions, decay)
  
  let animation_frame = interpolation_resolution
  
  const animation_handle = setInterval(function() {
    
    // If we've reached a curve end point, then generate a new one
    if (animation_frame >= interpolation_resolution) {
      curve_1 = curve_2
      curve_2 = makeCurve(steps, dimensions, decay)
      animation_frame = -1
    }
    
    // Move to the next frame in the interpolation between the two end points
    animation_frame += 1
    const lerp_t = animation_frame / interpolation_resolution
	  
    // Calculate points on interpolated curve
    const z_real_points = []
    const z_imaginary_points = []
    for (let theta_i=0; theta_i<theta_resolution; theta_i++) {
      const theta = Math.PI * 2 * theta_i / theta_resolution
      let z_real = 0
      let z_imaginary = 0
      for (const k in curve_1.magnitude_coefficients) {
        const magnitude_coefficient = (1 - lerp_t) * curve_1.magnitude_coefficients[k] + lerp_t * curve_2.magnitude_coefficients[k]
        const angle_coefficient = (1 - lerp_t) * curve_1.angle_coefficients[k] + lerp_t * curve_2.angle_coefficients[k]
        z_real += (magnitude_coefficient * Math.cos(angle_coefficient * theta))
        z_imaginary += (magnitude_coefficient * Math.sin(angle_coefficient * theta))
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
    
    // Paint background
    ctx.fillStyle = "rgb(230, 230, 230)";
    ctx.fillRect(-width/2, -height/2, width, height);
    
    // Paint curve
    ctx.fillStyle = "rgb(50, 50, 50)"
    ctx.strokeStyle = "rgb(50, 50, 50)"
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(z_real_draw_points[z_real_draw_points.length-1], z_imaginary_draw_points[z_real_draw_points.length-1])
    for (const i in z_real_draw_points) {
      ctx.lineTo(z_real_draw_points[i], z_imaginary_draw_points[i])
    }
    ctx.stroke()
  },
  interpolation_timestep)

}

main()

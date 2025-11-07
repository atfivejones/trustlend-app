export default function handler(req, res) {
  res.status(200).json({
    node: process.versions.node,
    runtime: process.env.AWS_EXECUTION_ENV || 'vercel-serverless',
  });
}

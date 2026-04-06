import * as fs from 'fs';
import * as path from 'path';

async function testSync(dirPath: string, iterations: number) {
  const gitDir = path.join(dirPath, ".git");
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    try {
      const stat = fs.statSync(gitDir);
      stat.isDirectory();
    } catch {
      //
    }
  }
  const end = performance.now();
  return end - start;
}

async function testAsync(dirPath: string, iterations: number) {
  const gitDir = path.join(dirPath, ".git");
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    try {
      const stat = await fs.promises.stat(gitDir);
      stat.isDirectory();
    } catch {
      //
    }
  }
  const end = performance.now();
  return end - start;
}

async function testParallelAsync(dirPath: string, iterations: number) {
  const gitDir = path.join(dirPath, ".git");
  const start = performance.now();

  const promises = [];
  for (let i = 0; i < iterations; i++) {
    promises.push((async () => {
      try {
        const stat = await fs.promises.stat(gitDir);
        stat.isDirectory();
      } catch {
        //
      }
    })());
  }
  await Promise.all(promises);

  const end = performance.now();
  return end - start;
}

async function main() {
  const dirPath = process.cwd();
  const iterations = 50000;

  // warm up
  await testSync(dirPath, 1000);
  await testAsync(dirPath, 1000);
  await testParallelAsync(dirPath, 1000);

  console.log(`Sync time: ${await testSync(dirPath, iterations)} ms`);
  console.log(`Async time: ${await testAsync(dirPath, iterations)} ms`);
  console.log(`Parallel Async time: ${await testParallelAsync(dirPath, iterations)} ms`);
}

main();
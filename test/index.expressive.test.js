// import {
//     mkChecker,
//     xDescribe,
//     xContext,
//     xIt,
//     withArg,
// } from '@leadpixel/expressive';
// import { memoSelector } from '../src/index';
// import { mock } from './mock';

// const callsMockTimes = mkChecker((thisMock, count) => ({
//     op: () => thisMock.callCount() === count,
//     msg: `calls mock ${count} times`,
// }));

// xDescribe(memoSelector, () => {
//     xContext(withArg([(x) => x.key]), () => {
//         xContext(withArg(mock()), (transformer) => {
//             xIt((getValueUnderTest) => {
//                 const selector = getValueUnderTest();
//                 selector({ key: 'a' });
//                 selector({ key: 'b' });

//                 return callsMockTimes(transformer, 2)(() => {});
//             });

//             // xIt(selector => {
//             //     selector({ key: 'c' });
//             //     selector({ key: 'd' });
//             //     expect(transformer.firstCall().args).toEqual(['c']);
//             //     return true
//             // })
//         });
//     });
// });

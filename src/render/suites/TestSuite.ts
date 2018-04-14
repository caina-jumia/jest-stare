import { Constants } from "../Constants";
import { isNullOrUndefined } from "util";
import { Test } from "../tests/Test";
import { IResultsProcessorInput } from "../../processor/doc/jest/IResultsProcessorInput";

/**
 * Create test suites
 * @export
 * @class TestSuite
 */
export class TestSuite {

    /**
     * Build table info for specific tests
     * @static
     * @returns {HTMLElement[]} - populated html elements
     * @memberof TestSuite
     */
    public static create(results: IResultsProcessorInput): HTMLElement[] {
        const elements: HTMLElement[] = [];
        const describeLevels: number[] = [];

        results.testResults.forEach((testResult) => {

            // TODO(Kelosky): set for pending
            let testStatusClass = Constants.PASSED_TEST;

            const testSectionStatus: Map<string, string> = new Map<string, string>();
            for (const result of testResult.testResults) {

                // mark overall status for a suite
                if (result.status === Constants.TEST_STATUS_FAIL) {
                    if (testStatusClass === Constants.BOTH_TEST) {
                        // do nothing
                    } else if (testStatusClass === Constants.PASSED_TEST) {
                        testStatusClass = Constants.BOTH_TEST;
                    } else {
                        testStatusClass = Constants.FAILED_TEST; // overall
                    }
                    // mark all lower test sections as containing a failed test for filtering
                    for (const ancestorTitle of result.ancestorTitles) {
                        const checkStatus = testSectionStatus.get(ancestorTitle);
                        if (!isNullOrUndefined(checkStatus)) {
                            if (checkStatus === Constants.PASSED_TEST) {
                                testSectionStatus.set(ancestorTitle, Constants.BOTH_TEST);
                            }
                        } else {
                            testSectionStatus.set(ancestorTitle, Constants.FAILED_TEST);
                        }
                    }
                }
                // mark overall status for a suite
                if (result.status === Constants.TEST_STATUS_PASS) {
                    if (testStatusClass === Constants.BOTH_TEST) {
                        // do nothing
                    }
                    else if (testStatusClass === Constants.FAILED_TEST) {
                        testStatusClass = Constants.BOTH_TEST;
                    } else {
                        testStatusClass = Constants.PASSED_TEST;
                    }

                    // mark all lower test sections as containing a passed test for filtering
                    for (const ancestorTitle of result.ancestorTitles) {
                        const checkStatus = testSectionStatus.get(ancestorTitle);
                        if (!isNullOrUndefined(checkStatus)) {
                            if (checkStatus === Constants.FAILED_TEST) {
                                testSectionStatus.set(ancestorTitle, Constants.BOTH_TEST);
                            }
                        } else {
                            testSectionStatus.set(ancestorTitle, Constants.PASSED_TEST);
                        }
                    }
                }
            }

            const div = document.createElement("div") as HTMLDivElement;
            div.classList.add("my-3", "p-3", "bg-white", "rounded", "box-shadow", testStatusClass);

            const h5 = document.createElement("h5") as HTMLHeadingElement;
            h5.classList.add("border-bottom", "border-gray", "pb-2", "mb-0", "display-5");
            h5.textContent = testResult.testFilePath;

            div.appendChild(h5);

            // let lastNoAncestorParent: HTMLElement = div;
            const divMap: Map<string, HTMLElement> = new Map<string, HTMLElement>();
            testResult.testResults.forEach((test) => {
                const element = Test.create(test);
                if (test.ancestorTitles.length > 0) {
                    test.ancestorTitles.forEach((title, index) => {

                        const titlesCopy = test.ancestorTitles.slice();
                        titlesCopy.splice(index + 1);
                        const key = titlesCopy.join(".");
                        if (divMap.has(key)) {
                            divMap.get(key).appendChild(element);
                        } else {
                            const nestDiv = document.createElement("div") as HTMLDivElement;
                            const statusClass = testSectionStatus.get(title) || Constants.PASSED_TEST;
                            nestDiv.classList.add("my-3", "p-3", "bg-white", "rounded", "box-shadow", statusClass);
                            const h6 = document.createElement("h6") as HTMLHeadingElement;
                            h6.classList.add("border-bottom", "border-gray", "pb-2", "mb-0", "display-6");
                            h6.textContent = title;
                            nestDiv.appendChild(h6);
                            nestDiv.appendChild(element);

                            divMap.set(key, nestDiv);

                            if (index === 0) {
                                div.appendChild(nestDiv);
                            } else {
                                titlesCopy.pop();
                                const parentKey = titlesCopy.join(".");
                                divMap.get(parentKey).appendChild(nestDiv);
                            }
                        }
                    });
                } else {
                    div.appendChild(element);
                }
            });

            elements.push(div);
        });

        return elements;
    }
}

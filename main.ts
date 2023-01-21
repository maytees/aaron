import {
  Input,
  Secret,
} from "https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts";
import { xml2js } from "https://deno.land/x/xml2js@1.0.0/mod.ts";
import axiod from "https://deno.land/x/axiod/mod.ts";
import { colors } from "https://deno.land/x/cliffy@v0.25.7/ansi/mod.ts";

const parseOpts: Record<string, unknown> = {
  compact: true,
  trim: true,
  alwaysArray: [
    "EmergencyContact",
    "UserDefinedItem",
    "UserDefinedGroupBox",
    "TermListing",
    "TermDefCode",
    "ClassListing",
    "DistrictEventRecord",
    "HealthVisitListing",
    "HealthConditionsListing",
    "HealthImmunizationListing",
    "ImmunizationDate",
    "ReportPeriod",
    "Course",
    "Mark",
    "Assignment",
    "EventList",
    "Absence",
    "Period",
    "PeriodTotal",
  ],
};

let userId: string, password: string;

const ax = axiod.create({
  baseURL: "https://sisstudent.fcps.edu/SVUE/Service/PXPCommunication.asmx",
});

async function getGrades(id: string, pass: string) {
  const res = await ax.post("/ProcessWebServiceRequest", {
    userID: id,
    password: pass,
    skipLoginLog: true,
    parent: false,
    webServiceHandleName: "PXPWebServices",
    methodName: "Gradebook",
    paramStr: "<Parms/>",
  });

  return await xml2js(res.data.d, { compact: true }).Gradebook;
}

await main();

async function main() {
  userId = await Input.prompt({
    message: "Enter your FCPS user id",
    default: userId,
  });

  password = await Secret.prompt({
    message: "Enter your FCPS password",
    default: password,
  });

  const gradebook: any = await getGrades(userId, password);

  // Display grades
  gradebook.Courses.Course.forEach((course: any) => {
    const attribs = course._attributes;
    console.log("\n" + colors.bold.cyan(attribs.Title))
    console.log("Grade: " + course.Marks.Mark[0]._attributes.CalculatedScoreString)
    console.log("Percentage: %" + course.Marks.Mark[0]._attributes.CalculatedScoreRaw)
  });
}

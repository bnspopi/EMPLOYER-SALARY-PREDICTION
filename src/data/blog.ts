/**
 * PayLens editorial posts. Each body is an array of plain paragraphs (300–500 words total).
 * Original writing; no external content is reproduced.
 */
import type { BlogPost } from "./types";

export const POSTS: BlogPost[] = [
  {
    slug: "resume-salary-estimators-how-they-work",
    title: "How Resume-Based Salary Estimators Actually Work",
    category: "Guide",
    date: "2026-08-30",
    author: "PayLens Research",
    summary:
      "Why pricing a resume beats pricing a job title, and what a good estimator does under the hood.",
    body: [
      "Most salary tools price a job title. You type in \"Product Manager\", pick a city, and get an average dragged from thousands of self-reported numbers. The problem is that a title is a poor predictor of pay. Two people who both call themselves a senior PM can be sixty thousand dollars apart, because one owns a business line and the other owns a single feature. Averaging them together produces a figure that describes nobody in particular.",
      "A resume-based estimator works differently. Instead of starting from the title, it starts from the evidence: the specific skills you list, the scope of the work you describe, the seniority your bullet points imply, and the location you work in. It reads those signals the way an experienced recruiter would, then compares the resulting profile against live vacancies that publish a real salary. The output is a floor, a median and a ceiling for your exact combination of attributes, not a crowd average for your job title.",
      "The mechanics come down to three steps. First, the tool parses the resume into a structured profile, normalising your titles to a canonical role, inferring a level from years and responsibility language, and rating each skill for how current and relevant it is. Second, it weights those skills by how much they actually move pay in the current market, which is where most of the accuracy comes from: a skill in high demand lifts the estimate, a stale one drags it. Third, it applies location and remote adjustments so the number reflects what employers in your city are really paying today.",
      "The reason this matters is that the estimate becomes actionable. A title average tells you that PMs make some number; it does not tell you what to change. A profile-based estimate can say that your product-strategy signal is strong, your data skills are underweighted, and adding evidence of one shipped outcome would move your median by a measurable amount. That turns a passive benchmark into a to-do list.",
      "No estimator is perfect, and the honest ones show you the uncertainty rather than hiding it behind a single confident figure. The width of the floor-to-ceiling band is itself information: a wide band means the market is unsure how to price you, usually because the resume is vague, and every skill you clarify tightens it. When you are reading any salary estimate, the first question to ask is not \"what is the number\" but \"what is this number actually built from\". If the answer is a title and a zip code, treat it as a rough starting point. If it is your real profile priced against live demand, you can plan around it.",
    ],
    tags: ["salary", "resume", "methodology"],
  },
  {
    slug: "glassdoor-alternatives-2026",
    title: "Glassdoor Alternatives for Salary Research in 2026",
    category: "Guide",
    date: "2026-08-16",
    author: "Editorial team",
    summary:
      "Where to look when crowd-sourced averages are not precise enough for your decision.",
    body: [
      "Glassdoor built the habit of checking a salary before an interview, and for a long time a crowd-sourced average was better than nothing. But in 2026 the limits of that model are hard to ignore. Self-reported figures lag the market, skew toward the people motivated to submit them, and collapse wildly different jobs under one title. If you are making a real decision, accepting an offer, asking for a raise, choosing between cities, an average from an unknown mix of respondents is a shaky foundation.",
      "The strongest alternatives share one trait: they price against live demand rather than memory. Tools that read current job postings with published salaries reflect what employers are willing to pay right now, not what someone earned two years ago. That freshness matters most in fast-moving fields, where a role can re-price by ten percent in a single year as demand shifts.",
      "The second thing to look for is granularity. A good source distinguishes a senior engineer in San Francisco from one in Austin, and a remote role from an on-site one, because those differences are larger than the difference between many job titles. If a tool only offers a national number, it is hiding the variable that will actually determine your pay.",
      "The third is transparency about method. You should be able to tell whether a figure is base salary or total compensation, how many data points it rests on, and how recently it was updated. Sources that bundle equity and bonus into a single headline number without saying so make comparisons across offers almost meaningless, because the mix varies enormously by company type.",
      "For most people the right approach is triangulation. Use a live-demand estimator for your specific profile, cross-check it against a title-level source to sanity-check the ballpark, and, where you can, talk to people doing the actual job. No single tool is authoritative, but the combination of a personalised estimate, a market benchmark and a human reality check will get you far closer to the truth than any one average. The goal is not a perfect number; it is a defensible range you can walk into a conversation with.",
    ],
    tags: ["salary", "research", "tools"],
  },
  {
    slug: "raise-vs-bonus-math",
    title: "Raise vs Bonus: The Math People Skip",
    category: "Analytics",
    date: "2026-08-02",
    author: "PayLens Research",
    summary:
      "A one-time bonus and a permanent raise are not interchangeable. Here is how to compare them properly.",
    body: [
      "When a company wants to reward you but cannot, or will not, move your base, it often reaches for a bonus. A bonus feels good because it arrives as a lump sum, but comparing it to a raise on equal terms requires a little arithmetic that most people skip. The short version: a raise compounds and a bonus does not, so even a modest raise usually beats a larger one-time payment over any reasonable horizon.",
      "Start with the mechanics. A five thousand dollar bonus is five thousand dollars, once. A five thousand dollar raise is five thousand dollars this year, plus five thousand next year, plus five thousand the year after, and it becomes the base that every future raise is calculated from. If you get three percent annual increases, that raise is quietly growing while the bonus has already been spent. Over five years the raise is worth more than five times the bonus before you even account for compounding.",
      "The comparison gets sharper when you think about your next job. Employers frequently anchor an offer to your current base, and recruiters ask for it directly in many markets. A higher base travels with you; a bonus does not. Two candidates who were paid identically in total last year, one through a higher base and one through a fat bonus, will often receive different offers precisely because the base is what the next company sees first.",
      "None of this means a bonus is worthless. A one-time payment can be exactly right for a one-time contribution, and it is often easier for a manager to approve than a permanent budget change. Retention bonuses, sign-on bonuses and spot awards all have a place. The mistake is treating a bonus as equivalent to a raise of the same headline size when you are negotiating, because they are not equivalent in value.",
      "The practical rule is to convert everything to an annual, recurring figure before you decide. Ask what the bonus would be worth as a raise, then judge whether the company is really offering you more or simply offering you a number that looks bigger. When you can, push for base first and take the bonus as the sweetener, not the substitute. If the answer is that base cannot move this cycle, get the reason and the timeline in writing, so the bonus becomes a bridge to the raise rather than a replacement for it.",
    ],
    tags: ["negotiation", "compensation", "raise"],
  },
  {
    slug: "how-to-compare-job-offers",
    title: "How to Compare Two Job Offers Without Fooling Yourself",
    category: "Guide",
    date: "2026-07-19",
    author: "Editorial team",
    summary:
      "Total compensation, risk and growth all matter. A structured way to weigh competing offers.",
    body: [
      "Comparing two offers by base salary alone is the most common and most expensive mistake in a job search. Base is the easiest number to read, which is exactly why it dominates attention it does not deserve. A complete comparison has to account for the whole package, the risk attached to each piece, and the growth the role sets you up for.",
      "Begin by normalising total compensation. Add base, expected bonus, the annualised value of equity, and any sign-on spread across the time you plan to stay. Then subtract the parts that are not really yours yet: unvested equity you would forfeit if you left, bonuses contingent on targets you may not hit. What remains is a defensible estimate of what each offer pays per year, which is often very different from the headline the recruiter led with.",
      "Next, weight the risk. Cash is certain, public-company stock is fairly liquid, and private-company equity is a lottery ticket with a wide range of outcomes. An offer that looks larger because half of it is private equity is not larger in any guaranteed sense; it is a bet. Neither is wrong, but you should know which parts of your compensation are promises and which are hopes, and price them accordingly.",
      "Then look past the money at growth. The role that pays slightly less but puts you on a steeper learning curve, gives you ownership sooner, or sits in a faster-growing part of the market can be worth far more over a few years than the extra few thousand dollars up front. Ask what the job does to your next offer, not just your current one. Scope, mentorship and the trajectory of the team are compensation you collect later.",
      "Finally, weigh the things that do not show up on the offer letter but govern your daily life: the commute or remote policy, the manager you would report to, the stability of the company, and how the work fits what you actually want to be doing. A structured comparison does not tell you which offer to take, but it stops you from being seduced by the biggest number in the largest font. Score each offer across compensation, risk, growth and fit, decide in advance how much each matters to you, and let the framework, not the adrenaline of the moment, make the call.",
    ],
    tags: ["offers", "negotiation", "career"],
  },
  {
    slug: "can-you-lose-an-offer-by-negotiating",
    title: "Can You Lose an Offer by Negotiating? What the Data Says",
    category: "Analytics",
    date: "2026-07-05",
    author: "PayLens Research",
    summary:
      "The fear that stops most people from negotiating is largely unfounded. Here is how to do it safely.",
    body: [
      "The single biggest reason people accept the first number they are offered is the fear that asking for more will make the offer disappear. It is a reasonable worry and, in the overwhelming majority of cases, an unfounded one. Rescinding an offer over a polite, reasonable counter is rare, expensive for the employer, and a sign of a company you would not want to work for anyway.",
      "Consider the employer's position. By the time you have an offer, the company has spent weeks screening, interviewing and aligning stakeholders on you specifically. Pulling the offer means restarting that process, and it broadcasts to everyone involved that the company negotiates in bad faith. A hiring manager who has just fought internally to get you approved has every incentive to close the deal, not blow it up over a few thousand dollars.",
      "That said, negotiation can go badly when it is done badly. The failures almost never come from the ask itself; they come from how it is delivered. An aggressive, entitled tone, a demand with no justification, an ultimatum you are not prepared to honour, or a counter wildly out of line with the market can sour a relationship even if the offer survives. The risk is not negotiating; it is negotiating like someone the team would rather not work with.",
      "The safe version is straightforward. Anchor your ask to the market, not to your needs: \"based on what I am seeing for this role and level, I was hoping we could get the base closer to X\" is far stronger than \"I need more\". Ask for a specific number with a brief reason, stay warm and collaborative, and make clear you are enthusiastic about the role. You are inviting the employer to solve a problem with you, not issuing a threat.",
      "It also helps to know your walk-away point before you start, so you never bluff with an ultimatum you cannot back. If the answer is no, a graceful \"understood, I am still excited to join\" costs you nothing and often surfaces a bonus or a review-date commitment instead. The realistic downside of a well-framed negotiation is that the company says no and you accept the original offer, exactly where you would have been anyway. The upside is a permanently higher base. Measured against that, staying silent is the genuinely risky choice.",
    ],
    tags: ["negotiation", "offers"],
  },
  {
    slug: "ai-exposure-and-salary-2026",
    title: "AI Exposure and Salary in 2026: Which Roles Are Repricing",
    category: "Report",
    date: "2026-06-21",
    author: "PayLens Research",
    summary:
      "AI is not flattening every salary equally. The pattern is a widening gap between execution and judgment.",
    body: [
      "Two years of AI tooling in the workplace have not produced the uniform wage collapse some predicted, nor the universal windfall others promised. What the 2026 data shows instead is a repricing along a specific seam: work that is mostly execution is under pressure, while work that is mostly judgment is holding or gaining. The gap between the two, which used to be modest within a job family, is widening.",
      "The clearest example is in content and support. Routine writing, first-line ticket handling and basic reporting are exactly the tasks that current tools do adequately, and roles built around them have seen pay stagnate as the volume tier shrinks. But the specialists in those same families, the support engineer who debugs the failures automation cannot, the marketer who owns strategy and measurement, have become more valuable, not less, because someone still has to direct and check the machine.",
      "Engineering follows the same logic with a twist. AI has made writing code faster, which lowers the value of raw output and raises the value of everything around it: system design, judgment about what to build, the ability to review and integrate work safely. Junior roles feel this most, because their traditional entry task, producing straightforward code under supervision, is the part most easily assisted. Senior scope, where the job is deciding and owning rather than typing, has been comparatively insulated.",
      "For individuals, the signal is to move up the value chain within your field rather than out of it. The durable premium is on ownership, taste and the ability to be accountable for outcomes, the parts of a job that require context and judgment the tools do not have. Skills that mainly speed up execution are worth having, but they are increasingly table stakes rather than differentiators, because everyone has access to the same assistance.",
      "The practical implication for pay is that the old strategy of accumulating tenure in an execution-heavy role is weaker than it was. The stronger play is to deliberately take on the parts of the work that resist automation, ambiguity, cross-functional influence, responsibility for a real result, and to make that shift visible on your resume. The market is not paying less for judgment; it is paying more, and it is paying it to the people who can show they have it.",
    ],
    tags: ["ai", "trends", "salary"],
  },
  {
    slug: "market-adjustment-raises",
    title: "Market Adjustment Raises: How to Ask When You're Underpaid",
    category: "Guide",
    date: "2026-06-07",
    author: "Editorial team",
    summary:
      "When your pay has drifted below market, a market adjustment is a different conversation from a performance raise.",
    body: [
      "There are two kinds of raise, and confusing them is why so many underpaid people stay underpaid. A performance raise rewards how well you have done your job. A market adjustment corrects a gap between what you are paid and what your role now commands, regardless of your performance. If you have been in the same job while the market moved up around you, the second conversation is the one you need, and it follows different rules.",
      "The gap usually opens quietly. Companies raise salaries for new hires to compete for talent, but rarely re-benchmark existing staff at the same pace, so loyal employees drift below the going rate. This is so common it has a name, salary compression, where a new colleague earns as much or more than someone senior to them. It is not a reflection of your value; it is an artifact of how pay is administered, and that framing is exactly what makes it winnable.",
      "The key to a market adjustment is that it is about the role, not about you, which takes the emotional charge out of it. You are not arguing that you deserve more because you worked hard; you are pointing out that the market rate for what you do has risen and your pay has not kept up. That is a factual claim a manager can take to their own boss without it becoming a referendum on your character.",
      "Bring evidence. A credible estimate of the current market range for your role, level and city, ideally from live demand rather than an old average, turns a feeling into a number. \"I looked into it and comparable roles are paying between X and Y; I am currently at Z\" is a sentence a reasonable manager cannot easily dismiss. The more specific and current your data, the harder it is to wave away as an opinion.",
      "Timing and tone finish the job. Raise it outside the emotional heat of a review if you can, frame it as wanting to fix an obvious discrepancy so you can keep doing great work, and give the company a path to yes, including a timeline if the budget genuinely cannot move this quarter. Most managers would rather adjust your pay than replace you, because replacing you costs more than the gap. Your job is to make the correction easy to justify, not to make anyone feel cornered.",
    ],
    tags: ["raise", "negotiation", "underpaid"],
  },
  {
    slug: "equity-compensation-basics",
    title: "Equity Compensation Basics: RSUs, Options and Vesting",
    category: "Guide",
    date: "2026-05-24",
    author: "Editorial team",
    summary:
      "A plain-language guide to the equity in your offer, and the questions that determine what it is worth.",
    body: [
      "Equity is the part of an offer that most people understand least and therefore value worst, either dismissing it entirely or treating a large paper number as if it were cash in the bank. The truth sits in between, and getting it right starts with knowing which kind of equity you have been given, because RSUs and stock options behave very differently.",
      "Restricted stock units, or RSUs, are the simpler instrument. Each unit becomes an actual share when it vests, and at that point it is worth whatever the share is worth, minus tax. RSUs almost always retain some value as long as the company has any, which makes them the closest equity gets to deferred cash. The main variables are the current share price, the vesting schedule, and, for private companies, whether you can ever sell.",
      "Stock options are a right to buy shares at a fixed price, the strike, set when they are granted. They are only worth something if the share price rises above the strike, and worthless if it does not. That leverage is why early-stage options can be lottery tickets: enormous upside if the company succeeds, nothing if it does not. Understanding your strike price and the company's current valuation tells you whether your options are already in the money or a bet on the future.",
      "Vesting governs when any of this becomes yours. The standard shape is four years with a one-year cliff, meaning you get nothing if you leave in the first year, a quarter at the one-year mark, and the rest in monthly or quarterly slices after that. Equity is therefore a retention tool as much as a reward: leaving early forfeits the unvested portion, and the schedule is designed to keep you around. Always know how much of your grant you would actually walk away with at any given point.",
      "The questions that determine real value are few but decisive. What is the strike price and the current valuation? What is the vesting schedule and cliff? Is the company public or private, and if private, is there any way to sell before an exit? What happens to unvested equity if you leave, or if the company is acquired? An offer with a big equity number and no answers to these questions is not a big offer; it is an unknown one. Price the equity by what it would be worth in a realistic outcome, not the headline, and let the certain parts of the package carry most of the decision.",
    ],
    tags: ["equity", "compensation", "rsu"],
  },
  {
    slug: "levels-fyi-alternatives-non-big-tech",
    title: "Levels.fyi Alternatives for Non-Big-Tech Roles",
    category: "Guide",
    date: "2026-05-10",
    author: "PayLens Research",
    summary:
      "Big-tech leveling data is excellent for big tech and unhelpful for everyone else. Where to look instead.",
    body: [
      "Levels.fyi did something genuinely useful: it made total compensation at large technology companies transparent, level by level, so a candidate could see what an L5 at one firm really earned against an equivalent at another. For its intended audience, engineers and product people at big tech, it remains one of the best resources available. The problem is that most jobs are not big-tech jobs, and outside that world the model breaks down.",
      "The first reason is leveling itself. The neat ladders that make big-tech data legible, L3 to L4 to L5 with defined bands, simply do not exist at most companies. A five-person startup, a regional bank, a hospital network and a marketing agency do not share a leveling system, so there is nothing to map onto. Asking what an L5 earns at a company that has never used levels produces a question with no answer.",
      "The second is coverage. Crowd-sourced compensation data is dense where the crowd is, and the crowd is concentrated in a handful of high-paying tech hubs and companies. For a customer service lead in Manchester, an operations specialist in Denver or a nurse in Toronto, the sample thins to nothing, and a thin sample produces numbers that are worse than no numbers because they look authoritative while being nearly random.",
      "The third is composition. Big-tech pay is equity-heavy, and tools built for it foreground total compensation with large stock components. For the majority of roles where pay is mostly or entirely base salary, a total-compensation frame is actively misleading, inflating or confusing the comparison you actually need to make.",
      "The better fit for non-big-tech roles is a source that prices your specific profile against live job postings across all industries and levels, in local currency, and shows base salary clearly separated from any variable pay. Because it reads current demand rather than waiting for enough people in your exact niche to self-report, it can produce a usable range even for roles the crowd has never covered. Big-tech leveling tools answer a narrow question extremely well; for everyone outside that lane, the question is different and the tool should be too.",
    ],
    tags: ["tools", "research", "salary"],
  },
  {
    slug: "seven-days-after-a-layoff",
    title: "The First 7 Days After a Layoff: A Practical Plan",
    category: "Guide",
    date: "2026-04-26",
    author: "Editorial team",
    summary:
      "A calm, concrete checklist for the week after losing a job, before the emotional fog lifts.",
    body: [
      "A layoff lands as a shock even when you saw it coming, and the first instinct, to either freeze or fire off a hundred applications in a panic, is usually the wrong one. The first week is better spent stabilising your situation and setting up a search you can sustain, because a job hunt is a marathon and the decisions you make now shape how well you run it. Here is a plan for the seven days before the fog lifts.",
      "Days one and two are for logistics and breathing room. Read your separation agreement carefully before signing anything, and do not sign under pressure; you are often entitled to time to review it. Confirm the details that matter: your last day of pay and benefits, the terms of any severance, how long health coverage lasts and what it costs to continue, and the payout of any unused leave. File for unemployment benefits promptly, since they are often backdated to when you apply, not when you lost the job, so delay costs real money.",
      "Days three and four are for taking stock without acting yet. Write down your runway, how many months your savings cover at your real spending, because that number sets your urgency and your negotiating stance. Trim the obvious non-essential expenses now rather than later. Then, before touching your resume, spend an hour getting an honest read on your market value, so that when offers come you know what a fair one looks like and are not negotiating blind against your own anxiety.",
      "Days five and six are for rebuilding your story. Update your resume around outcomes rather than duties, refresh your professional profile, and draft a short, unembarrassed message explaining that you are looking. Layoffs are common and carry little stigma; the people most likely to help you already know that. Make a list of the twenty people most able to open a door and start reaching out, personally and specifically, not with a mass broadcast.",
      "Day seven is for building the routine that will carry the search. Decide how many hours a day you will spend on it and protect them, but protect your rest and exercise too, because burnout in week three helps no one. Set a simple system to track applications and follow-ups so nothing slips. The goal of the first week is not to have a new job; it is to be financially stable, emotionally steady and organised enough that the search ahead is a process you run, rather than a panic that runs you.",
    ],
    tags: ["layoff", "job-search", "career"],
  },
];

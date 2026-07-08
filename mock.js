const competitors = [
  { isMe: true, name: 'Abhay Raj Rathi', weight: 12.5, exercise: 'Bicep Curl (Dumbbell)' },
  { isMe: false, name: 'Abhay Raj Rathi', weight: 12.5, exercise: 'Bicep Curl (Dumbbell)' }
];
const currentUserProfile = { prs: { 'Bicep Curl (Dumbbell)': 12.5 } };
const exercise = 'Bicep Curl (Dumbbell)';
let myPr = 12.5;

const groups = [];
competitors.forEach(c => {
    if (groups.length > 0 && groups[groups.length - 1].weight === c.weight) {
        groups[groups.length - 1].members.push(c);
    } else {
        groups.push({ weight: c.weight, members: [c] });
    }
});

let overallIndex = 0;
let allRowsHtml = '';

allRowsHtml += groups.map((group) => {
    const groupRankIndex = overallIndex;
    
    let rankHtml = '#' + (groupRankIndex + 1);
    if (groupRankIndex === 0) rankHtml = '1st';

    let diffHtml = 'Tied';
    const displayExercise = group.members[0].exercise.split(' (')[0];
    
    const groupRowsHtml = group.members.map((c, mIndex) => {
        const isFirstInGroup = mIndex === 0;
        const isFirstOverall = overallIndex === 0 && isFirstInGroup;
        const rowspanCount = group.members.length;

        const exerciseTdHtml = isFirstOverall 
            ? `<td rowspan="${competitors.length}">${displayExercise}</td>` 
            : '';

        const rankTdHtml = isFirstInGroup ? `<td ${rowspanCount > 1 ? `rowspan="${rowspanCount}"` : ''}>${rankHtml}</td>` : '';
        const diffTdHtml = isFirstInGroup ? `<td ${rowspanCount > 1 ? `rowspan="${rowspanCount}"` : ''}>${diffHtml}</td>` : '';

        return `
            <tr>
                ${rankTdHtml}
                ${exerciseTdHtml}
                <td>${c.name}</td>
                <td>${c.weight} kg</td>
                ${diffTdHtml}
            </tr>
        `;
    }).join('');

    overallIndex += group.members.length;
    return groupRowsHtml;
}).join('');

console.log(allRowsHtml);

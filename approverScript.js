answer = [];
// It will search from the last level of category to first level of category to find a suitable approval criteria.
// If all categories don't contain approval criteria, it will use the approval criteria of KB instead

var approvalCriteria;
if(current.kb_category){
	approvalCriteria = getApproverCriteria(current.kb_category.sys_id);
} else {
	approvalCriteria = getApproverCriteria(current.kb_knowledge_base.sys_id);
}
if(approvalCriteria){
	answer.push(approvalCriteria.user);
	answer.push(approvalCriteria.group);
} else {
	var kb = current.kb_knowledge_base;
	answer.push(kb.owner);
	gs.error('Exception. Assign to KB owner instead.');
}

function getApproverCriteria(sysId){
	var gr = new GlideRecord('kb_category');
	gr.addQuery('sys_id', sysId);
	gr.query();
	if(gr.next()){
		// If the KC has approval group, then return the group
		if(gr.u_approval_user_criteria){
			return gr.u_approval_user_criteria;
		}
		gs.info(gr.parent_id);
		// If the KC has parent KC, then return pKC
		if(gr.parent_id){
			return getApproverCriteria(gr.parent_id);
		}
	}
	
	var gr2 = new GlideRecord('kb_knowledge_base');
	gr2.addQuery('sys_id', sysId); // is kb id
	gr2.query();
	if(gr2.next()){
		if(gr2.u_approval_user_criteria){
			return gr2.u_approval_user_criteria;
		}
	}
	gs.error('No such Knowledge Category or KB');
}

answer = getAttachmentReadAnswer();

function matchCriteria(userCriteria, sysId){
	var cr = new GlideRecord('user_criteria');
	cr.addQuery('sys_id', userCriteria);
	cr.query();
	if(cr.next()){
		var cGroupsNameArr = cr.group.split(", ");

		var myUserObject = gs.getUser();    
		var myGroups = myUserObject.getMyGroups();  
		var groupsArray = myGroups.toArray();  

		for(var i=0; i<groupsArray.length; i++){
			if(matchGroup(groupsArray[i], cGroupsNameArr))
				return true;
		}
	}
	return false;
}

function matchGroup(groupId, groupNameArr){
	for(var i=0; i<groupNameArr.length; i++){
		if(groupNameArr[i] === groupId)
			return true;
	}
	return false;
}

function getAttachmentReadAnswer() {	
	if (current.table_name.nil())
		return true;

	
	// If custom rule applied to attachment from KB article
	if(current.u_can_read){
		var userId = gs.getUserID();
		var canReadArr = current.u_can_read.split(", ");

		for(var i=0; i<canReadArr.length; i++){
			if(matchCriteria(canReadArr[i], userId)) {
				return true;
			}
		}
		return false;
	}
	if(current.u_cannot_read){
		var userId = gs.getUserID();
		var cannotReadArr = current.u_cannot_read.split(", ");

		for(var i=0; i<cannotReadArr.length; i++){
			if(matchCriteria(cannotReadArr[i], userId)) {
				return false;
			}
		}
		//return true;
		// follow parent rule
	}


	// If the attachment is from live feed,
	// grant it the read access
	if (current.table_name.indexOf("live_profile") > -1 || current.table_name.indexOf("live_group_profile") > -1)
		return true;

	// Remove Prefix
	var tableName = current.table_name;
	if (tableName.startsWith("invisible."))
		tableName = tableName.substring(10);
	else if (tableName.startsWith("ZZ_YY"))
		tableName = tableName.substring(5);

	var parentRecord = new GlideRecord(tableName);

	parentRecord.setWorkflow(false);
	if (!parentRecord.isValid() || !parentRecord.get(current.table_sys_id)) {
		if (current.sys_created_by.equals(gs.getUserName()))
			return true;
		return false;
	}

	return parentRecord.canRead();
}

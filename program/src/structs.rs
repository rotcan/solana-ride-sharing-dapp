use borsh::{BorshSerialize,BorshDeserialize};

#[derive(BorshSerialize,BorshDeserialize,Debug)]
pub struct CustomerData{
    pub profile_hash: String,
    pub updated_on: String,
    pub from_lat: String,
    pub to_lat:String,
    pub from_long: String,
    pub to_long:String,
    pub distance: String,
    pub final_cost: String,
    pub driver_address_1: String,
    pub cost_1: String,
    pub driver_address_2: String,
    pub cost_2: String,
    pub driver_address_3: String,
    pub cost_3: String,
    pub driver_address_4: String,
    pub cost_4: String,
    pub cost_1_max: String,
    pub cost_2_max: String,
    pub cost_3_max: String,
    pub cost_4_max: String,
    pub driver_select: String,
    pub driver_confirm: String,
    pub to_pay:String,
    pub ride_state:String,
    pub driver_pub_key:String
}

#[derive(BorshSerialize,BorshDeserialize,Debug)]
pub struct DriverData{
    pub profile_hash: String,
    pub updated_on: String,
    pub from_lat: String,
    pub to_lat:String,
    pub from_long: String,
    pub to_long:String,
    pub dist: String,
    pub cost: String,
    pub customer_1: String,
    pub customer_1_confirm: String,
    pub customer_2: String,
    pub customer_2_confirm: String,
    pub customer_3: String,
    pub customer_3_confirm: String,
    //pub customer_confirmed_rides:String,
    pub customer_rides_to_finish:String,
    pub customer_rides_paid: String,
    pub ride_state: String
}

#[derive(BorshSerialize,BorshDeserialize,Debug)]
pub struct RecordInstruction{
    pub profile_hash: String,
    pub record_type: String,
    pub user_type: String,
    pub from_lat: String,
    pub to_lat:String,
    // pub from_long: String,
    // pub to_long:String,
    // pub distance:String,
    // pub customer_count: String,
    pub updated_on: String,
    // pub driver_address: String,
    // pub customer_address: String
    // 1 to update Customer/Driver/Admin profile
    // 4 to create ride
    // 5 to finish ride from driver
    // 6 to update payment to driver
}

#[derive(BorshSerialize,BorshDeserialize,Debug)]
pub struct SingleInstruction{
    pub full_instruction: String,
}